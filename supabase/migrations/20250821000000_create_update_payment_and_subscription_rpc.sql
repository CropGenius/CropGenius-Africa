CREATE OR REPLACE FUNCTION update_payment_and_subscription(
    p_order_tracking_id TEXT,
    p_merchant_reference TEXT,
    p_status TEXT,
    p_payment_method TEXT,
    p_confirmation_code TEXT,
    p_user_email TEXT,
    p_amount NUMERIC
) RETURNS VOID AS $$
DECLARE
    v_plan_type TEXT;
    v_expiry_days INT;
BEGIN
    -- Upsert payment record
    INSERT INTO payments (order_tracking_id, merchant_reference, status, payment_method, confirmation_code, user_email, amount, created_at, updated_at)
    VALUES (p_order_tracking_id, p_merchant_reference, p_status, p_payment_method, p_confirmation_code, p_user_email, p_amount, NOW(), NOW())
    ON CONFLICT (order_tracking_id)
    DO UPDATE SET
        status = p_status,
        payment_method = p_payment_method,
        confirmation_code = p_confirmation_code,
        updated_at = NOW();

    -- If payment is completed, update subscription
    IF p_status = 'COMPLETED' THEN
        -- Determine plan type and expiry days
        v_plan_type := CASE WHEN p_amount >= 5000 THEN 'annual' ELSE 'monthly' END;
        v_expiry_days := CASE WHEN p_amount >= 5000 THEN 365 ELSE 30 END;

        -- Upsert user subscription
        INSERT INTO user_subscriptions (user_email, plan_type, status, activated_at, expires_at)
        VALUES (p_user_email, v_plan_type, 'active', NOW(), NOW() + (v_expiry_days || ' days')::INTERVAL)
        ON CONFLICT (user_email)
        DO UPDATE SET
            plan_type = v_plan_type,
            status = 'active',
            activated_at = NOW(),
            expires_at = NOW() + (v_expiry_days || ' days')::INTERVAL;
    END IF;
END;
$$ LANGUAGE plpgsql;