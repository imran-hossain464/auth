-- Insert sample users with hashed passwords
-- Password for all users: 'SecurePass123!'
INSERT INTO users (
    first_name, 
    last_name, 
    email, 
    password_hash, 
    email_verified, 
    role
) VALUES 
(
    'John', 
    'Doe', 
    'john.doe@example.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO',
    TRUE,
    'user'
),
(
    'Jane', 
    'Smith', 
    'jane.smith@example.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO',
    TRUE,
    'admin'
),
(
    'Bob', 
    'Johnson', 
    'bob.johnson@example.com', 
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIoO',
    FALSE,
    'user'
);

-- Insert sample security events
INSERT INTO security_events (
    user_id,
    event_type,
    event_description,
    ip_address,
    metadata
) VALUES 
(
    1,
    'LOGIN_SUCCESS',
    'User successfully logged in',
    '192.168.1.100',
    '{"browser": "Chrome", "os": "Windows"}'::jsonb
),
(
    1,
    'PASSWORD_CHANGE',
    'User changed password',
    '192.168.1.100',
    '{"previous_change": "2024-01-01"}'::jsonb
),
(
    2,
    'LOGIN_SUCCESS',
    'Admin user logged in',
    '192.168.1.101',
    '{"browser": "Firefox", "os": "macOS"}'::jsonb
);

-- Insert sample login attempts
INSERT INTO login_attempts (
    email,
    ip_address,
    user_agent,
    success,
    failure_reason
) VALUES 
(
    'john.doe@example.com',
    '192.168.1.100',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    TRUE,
    NULL
),
(
    'unknown@example.com',
    '192.168.1.200',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    FALSE,
    'INVALID_CREDENTIALS'
),
(
    'jane.smith@example.com',
    '192.168.1.101',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    TRUE,
    NULL
);
