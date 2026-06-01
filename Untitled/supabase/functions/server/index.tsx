import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Enable logger
app.use("*", logger(console.log));

// Enable CORS
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

// Health check
app.get("/make-server-de060722/health", (c) => {
  return c.json({ status: "ok" });
});

// =======================
// AUTHENTICATION ENDPOINTS
// =======================

// Register new user
app.post("/make-server-de060722/auth/register", async (c) => {
  try {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (password.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Require email verification
      user_metadata: { name },
    });

    if (authError) {
      console.error("Auth error:", authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email,
        full_name: name,
      });

    if (profileError) {
      console.error("Profile error:", profileError);
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: "Failed to create user profile" }, 500);
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await supabase.from("email_verification_codes").insert({
      user_id: authData.user.id,
      code: verificationCode,
      expires_at: expiresAt.toISOString(),
    });

    // TODO: Send verification email via SMTP
    console.log(`Verification code for ${email}: ${verificationCode}`);

    return c.json({
      success: true,
      userId: authData.user.id,
      message: "Registration successful. Please check your email for verification code.",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Registration failed" }, 500);
  }
});

// Verify email
app.post("/make-server-de060722/auth/verify-email", async (c) => {
  try {
    const { email, code } = await c.req.json();

    // Get user by email
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    const user = authData.users.find((u) => u.email === email);

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Check verification code
    const { data: codes, error: codeError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("code", code)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (codeError || !codes || codes.length === 0) {
      return c.json({ error: "Invalid or expired verification code" }, 400);
    }

    // Mark code as used
    await supabase
      .from("email_verification_codes")
      .update({ used: true })
      .eq("id", codes[0].id);

    // Confirm email in auth
    await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    });

    return c.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    return c.json({ error: "Verification failed" }, 500);
  }
});

// Login
app.post("/make-server-de060722/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return c.json({ error: error.message }, 401);
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return c.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name,
      },
      session: data.session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed" }, 500);
  }
});

// Get current user
app.get("/make-server-de060722/auth/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "No authorization header" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single();

    return c.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile?.full_name,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Failed to get user" }, 500);
  }
});

// =======================
// PAYMENT ENDPOINTS
// =======================

// IMPORTANT: NEVER store credit card information
// Use Stripe to handle all payment data securely

app.post("/make-server-de060722/create-payment-intent", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      radius,
      businessTypes,
      extraSelections,
      premiumTypes,
      totalPrice,
      location,
    } = await c.req.json();

    // TODO: Integrate with Stripe
    // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(totalPrice * 100), // Convert to cents
    //   currency: 'usd',
    //   metadata: { userId: userData.user.id }
    // });

    // For now, simulate payment
    const paymentIntentId = `pi_test_${Date.now()}`;

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        user_id: userData.user.id,
        radius_miles: radius,
        business_types: businessTypes,
        extra_selections: extraSelections || 0,
        premium_types: premiumTypes || [],
        total_price: totalPrice,
        location_address: location.address,
        location_city: location.city,
        location_state: location.state,
        location_zip: location.zipCode,
        stripe_payment_intent_id: paymentIntentId,
        status: "active",
      })
      .select()
      .single();

    if (purchaseError) {
      console.error("Purchase error:", purchaseError);
      return c.json({ error: "Failed to create purchase" }, 500);
    }

    return c.json({
      success: true,
      purchaseId: purchase.id,
      clientSecret: `${paymentIntentId}_secret`, // Stripe client secret
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return c.json({ error: "Failed to create payment intent" }, 500);
  }
});

// Confirm payment
app.post("/make-server-de060722/confirm-payment", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { purchaseId, paymentIntentId } = await c.req.json();

    // TODO: Verify payment with Stripe
    // const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
    // const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    // if (paymentIntent.status !== 'succeeded') {
    //   return c.json({ error: 'Payment not completed' }, 400);
    // }

    // Update purchase status
    await supabase
      .from("purchases")
      .update({ status: "active" })
      .eq("id", purchaseId)
      .eq("user_id", userData.user.id);

    return c.json({ success: true });
  } catch (error) {
    console.error("Confirm payment error:", error);
    return c.json({ error: "Failed to confirm payment" }, 500);
  }
});

// =======================
// LEADS ENDPOINTS
// =======================

// Get user's leads
app.get("/make-server-de060722/leads", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("ranking", { ascending: false });

    if (error) {
      console.error("Fetch leads error:", error);
      return c.json({ error: "Failed to fetch leads" }, 500);
    }

    return c.json({ leads });
  } catch (error) {
    console.error("Get leads error:", error);
    return c.json({ error: "Failed to get leads" }, 500);
  }
});

// Get user's purchases
app.get("/make-server-de060722/purchases", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("purchase_date", { ascending: false });

    if (error) {
      console.error("Fetch purchases error:", error);
      return c.json({ error: "Failed to fetch purchases" }, 500);
    }

    return c.json({ purchases });
  } catch (error) {
    console.error("Get purchases error:", error);
    return c.json({ error: "Failed to get purchases" }, 500);
  }
});

// Update lead status
app.put("/make-server-de060722/leads/:id", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const leadId = c.req.param("id");
    const updates = await c.req.json();

    const { data, error } = await supabase
      .from("leads")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .eq("user_id", userData.user.id)
      .select()
      .single();

    if (error) {
      console.error("Update lead error:", error);
      return c.json({ error: "Failed to update lead" }, 500);
    }

    return c.json({ success: true, lead: data });
  } catch (error) {
    console.error("Update lead error:", error);
    return c.json({ error: "Failed to update lead" }, 500);
  }
});

// Get analytics/stats
app.get("/make-server-de060722/analytics", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);

    if (userError || !userData.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Get lead stats
    const { data: leads } = await supabase
      .from("leads")
      .select("status, business_type, has_website, responded")
      .eq("user_id", userData.user.id);

    const stats = {
      total: leads?.length || 0,
      emailsSent: leads?.filter((l) => l.status !== "new").length || 0,
      responded: leads?.filter((l) => l.responded).length || 0,
      noWebsite: leads?.filter((l) => !l.has_website).length || 0,
      byBusinessType: {},
      byStatus: {},
    };

    leads?.forEach((lead) => {
      // Count by business type
      stats.byBusinessType[lead.business_type] = (stats.byBusinessType[lead.business_type] || 0) + 1;
      // Count by status
      stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1;
    });

    return c.json({ stats });
  } catch (error) {
    console.error("Get analytics error:", error);
    return c.json({ error: "Failed to get analytics" }, 500);
  }
});

// =======================
// OUTREACH SETTINGS / CSV SYNC
// =======================

async function getAuthedUser(c: any) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return { user: null, error: "Unauthorized" };
  }

  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user: data.user, error: null };
}

app.get("/make-server-de060722/outreach-settings", async (c) => {
  try {
    const { user, error } = await getAuthedUser(c);
    if (error || !user) return c.json({ error }, 401);

    const { data, error: profileError } = await supabase
      .from("users")
      .select("phone, outreach_email, smtp_app_password")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Fetch outreach settings error:", profileError);
      return c.json({ error: "Failed to fetch outreach settings" }, 500);
    }

    return c.json({
      settings: {
        phone: data?.phone || "",
        outreachEmail: data?.outreach_email || user.email || "",
        smtpAppPassword: data?.smtp_app_password || "",
      },
    });
  } catch (error) {
    console.error("Get outreach settings error:", error);
    return c.json({ error: "Failed to get outreach settings" }, 500);
  }
});

app.post("/make-server-de060722/outreach-settings", async (c) => {
  try {
    const { user, error } = await getAuthedUser(c);
    if (error || !user) return c.json({ error }, 401);

    const { phone, outreachEmail, smtpAppPassword } = await c.req.json();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        phone: phone || null,
        outreach_email: outreachEmail || user.email,
        smtp_app_password: smtpAppPassword || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Save outreach settings error:", updateError);
      return c.json({ error: "Failed to save outreach settings" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Post outreach settings error:", error);
    return c.json({ error: "Failed to save outreach settings" }, 500);
  }
});

app.get("/make-server-de060722/user-location", async (c) => {
  try {
    const { user, error } = await getAuthedUser(c);
    if (error || !user) return c.json({ error }, 401);

    const { data, error: profileError } = await supabase
      .from("users")
      .select("search_address, search_city, search_state, search_zip, preferred_radius_miles")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Fetch user location error:", profileError);
      return c.json({ error: "Failed to fetch saved location" }, 500);
    }

    return c.json({
      location: {
        address: data?.search_address || "",
        city: data?.search_city || "",
        state: data?.search_state || "",
        zipCode: data?.search_zip || "",
      },
      preferredRadius: data?.preferred_radius_miles || null,
    });
  } catch (error) {
    console.error("Get user location error:", error);
    return c.json({ error: "Failed to get saved location" }, 500);
  }
});

app.post("/make-server-de060722/user-location", async (c) => {
  try {
    const { user, error } = await getAuthedUser(c);
    if (error || !user) return c.json({ error }, 401);

    const { location, preferredRadius } = await c.req.json();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        search_address: location?.address || null,
        search_city: location?.city || null,
        search_state: location?.state || null,
        search_zip: location?.zipCode || null,
        preferred_radius_miles: preferredRadius || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Save user location error:", updateError);
      return c.json({ error: "Failed to save location" }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Post user location error:", error);
    return c.json({ error: "Failed to save location" }, 500);
  }
});

app.post("/make-server-de060722/upload-csv", async (c) => {
  try {
    const { user, error } = await getAuthedUser(c);
    if (error || !user) return c.json({ error }, 401);

    const { type, rows } = await c.req.json();
    if (!Array.isArray(rows)) {
      return c.json({ error: "Rows must be an array" }, 400);
    }

    if (type === "sentEmails") {
      const sentRows = rows
        .map((row: Record<string, string>) => ({
          user_id: user.id,
          email_address: (row.email || row.email_address || "").trim().toLowerCase(),
          email_type: row.email_type || "initial",
          subject: row.subject || null,
          sent_at: row.sent_at || row.last_contact || new Date().toISOString(),
        }))
        .filter((row: any) => row.email_address);

      if (sentRows.length > 0) {
        const { error: insertError } = await supabase.from("sent_emails").upsert(sentRows, {
          onConflict: "user_id,email_address,email_type",
          ignoreDuplicates: true,
        });

        if (insertError) {
          console.error("Sent email upload error:", insertError);
          return c.json({ error: "Failed to upload sent email history" }, 500);
        }
      }

      return c.json({ success: true, imported: sentRows.length });
    }

    if (type === "leads") {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!purchase?.id) {
        return c.json({ error: "Create a purchase before uploading lead rows" }, 400);
      }

      const leadRows = rows
        .map((row: Record<string, string>) => ({
          purchase_id: purchase.id,
          user_id: user.id,
          business_name: row.name || row["Business Name"] || row.business_name || "Unknown Business",
          business_type: row.business_type || row["Business Type"] || "General",
          phone: row.phone || row.Phone || null,
          email: row.email || row.Email || null,
          website: row.website || row["Website URL"] || null,
          has_website: !!(row.website || row["Website URL"]),
          place_id: row.place_id || null,
          profit_score: row.profit_score ? Number(row.profit_score) : null,
          ranking: row.ranking ? Number(row.ranking) : row.profit_score ? Number(row.profit_score) : null,
          status: row.status || "new",
          notes: row.notes || row.Notes || null,
          updated_at: new Date().toISOString(),
        }))
        .filter((row: any) => row.business_name);

      if (leadRows.length > 0) {
        const { error: insertError } = await supabase.from("leads").upsert(leadRows, {
          onConflict: "place_id",
          ignoreDuplicates: false,
        });

        if (insertError) {
          console.error("Lead upload error:", insertError);
          return c.json({ error: "Failed to upload leads" }, 500);
        }
      }

      return c.json({ success: true, imported: leadRows.length });
    }

    return c.json({ error: "Unknown CSV type" }, 400);
  } catch (error) {
    console.error("CSV upload error:", error);
    return c.json({ error: "Failed to upload CSV" }, 500);
  }
});

Deno.serve(app.fetch);
