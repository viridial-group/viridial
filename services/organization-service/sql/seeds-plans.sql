-- ============================================================================
-- PLANS SEED DATA
-- Based on Vtiger CRM pricing model
-- ============================================================================
-- This script seeds the plans, plan_features, plan_limits, and booster_packs tables
-- Run this after schema.sql

-- ============================================================================
-- DELETE EXISTING SEED DATA (to allow re-running the script)
-- ============================================================================
DELETE FROM subscription_booster_packs;
DELETE FROM user_plans;
DELETE FROM subscriptions;
DELETE FROM plan_limits;
DELETE FROM plan_features;
DELETE FROM plans;
DELETE FROM booster_packs;

-- ============================================================================
-- PLANS
-- ============================================================================

-- ONE PILOT (Free plan)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('pilot-monthly' || random()::text) from 1 for 8)),
    'pilot',
    'ONE PILOT',
    'Free plan - ideal for companies getting started on their CRM journey',
    'monthly',
    0.00,
    NULL,
    1,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'pilot' AND billing_period = 'monthly');

-- ONE GROWTH (Monthly)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('growth-monthly' || random()::text) from 1 for 8)),
    'growth',
    'ONE GROWTH',
    'Powered by AI - A CRM for small and medium-sized businesses',
    'monthly',
    12.00,
    NULL,
    2,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'growth' AND billing_period = 'monthly');

-- ONE GROWTH (Annual)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('growth-annual' || random()::text) from 1 for 8)),
    'growth',
    'ONE GROWTH',
    'Powered by AI - A CRM for small and medium-sized businesses',
    'annual',
    10.00,
    NULL,
    2,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'growth' AND billing_period = 'annual');

-- ONE PROFESSIONAL (Monthly - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('professional-monthly-standard' || random()::text) from 1 for 8)),
    'professional',
    'ONE PROFESSIONAL',
    'Powered by AI - A complete CRM that gets all your teams on the same page with Customer One View',
    'monthly',
    30.00,
    20.00,
    3,
    true,
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'professional' AND billing_period = 'monthly');

-- ONE PROFESSIONAL (Annual - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('professional-annual-standard' || random()::text) from 1 for 8)),
    'professional',
    'ONE PROFESSIONAL',
    'Powered by AI - A complete CRM that gets all your teams on the same page with Customer One View',
    'annual',
    25.00,
    17.00,
    3,
    true,
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'professional' AND billing_period = 'annual');

-- ONE ENTERPRISE (Monthly - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('enterprise-monthly-standard' || random()::text) from 1 for 8)),
    'enterprise',
    'ONE ENTERPRISE',
    'Powered by AI - Fully loaded enterprise grade CRM that gives you best-in-class features for a fraction of the cost',
    'monthly',
    42.00,
    30.00,
    4,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'enterprise' AND billing_period = 'monthly');

-- ONE ENTERPRISE (Annual - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('enterprise-annual-standard' || random()::text) from 1 for 8)),
    'enterprise',
    'ONE ENTERPRISE',
    'Powered by AI - Fully loaded enterprise grade CRM that gives you best-in-class features for a fraction of the cost',
    'annual',
    35.00,
    25.00,
    4,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'enterprise' AND billing_period = 'annual');

-- ONE AI (Monthly - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('ai-monthly-standard' || random()::text) from 1 for 8)),
    'ai',
    'ONE AI',
    'Powered by AI - Enterprise-grade CRM with predictive and generative AI features for maximizing AI potential',
    'monthly',
    50.00,
    38.00,
    5,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'ai' AND billing_period = 'monthly');

-- ONE AI (Annual - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('ai-annual-standard' || random()::text) from 1 for 8)),
    'ai',
    'ONE AI',
    'Powered by AI - Enterprise-grade CRM with predictive and generative AI features for maximizing AI potential',
    'annual',
    42.00,
    32.00,
    5,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'ai' AND billing_period = 'annual');

-- ============================================================================
-- PLAN LIMITS
-- ============================================================================

-- ONE PILOT Limits
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('pilot-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    10,
    'users',
    false,
    'Maximum number of users allowed'
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('pilot-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    3000,
    'records',
    false,
    'Maximum number of records allowed'
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('pilot-storage' || random()::text) from 1 for 8)),
    p.id,
    'storage',
    'Storage',
    3,
    'GB',
    false,
    'Storage space included'
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'storage');

-- ONE GROWTH Limits
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('growth-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    15,
    'users',
    false,
    'Maximum number of users allowed'
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('growth-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    100000,
    'records',
    false,
    'Maximum number of records allowed'
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('growth-emails' || random()::text) from 1 for 8)),
    p.id,
    'emails',
    'Emails per Month',
    5000,
    'emails/month',
    false,
    'Email sending limit per month (or 500 per user)'
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'emails');

-- ONE PROFESSIONAL Limits
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('professional-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    NULL,
    'users',
    true,
    'Unlimited users'
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('professional-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    NULL,
    'records',
    true,
    'Unlimited records'
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('professional-emails' || random()::text) from 1 for 8)),
    p.id,
    'emails',
    'Emails per Month',
    20000,
    'emails/month',
    false,
    'Email sending limit per month (or 2000 per user)'
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'emails');

-- ONE ENTERPRISE Limits (same as Professional but with additional features)
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('enterprise-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    NULL,
    'users',
    true,
    'Unlimited users'
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('enterprise-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    NULL,
    'records',
    true,
    'Unlimited records'
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

-- ONE AI Limits (same as Enterprise)
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('ai-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    NULL,
    'users',
    true,
    'Unlimited users'
FROM plans p
WHERE p.plan_type = 'ai' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('ai-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    NULL,
    'records',
    true,
    'Unlimited records'
FROM plans p
WHERE p.plan_type = 'ai' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

-- ============================================================================
-- PLAN FEATURES
-- ============================================================================

-- ONE PILOT Features
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-lead-contact' || random()::text) from 1 for 8)),
    p.id,
    'Lead & Contact Management',
    'Leads, Contacts and Organizations, One View, Idle Alerts, Duplicate Prevention, Profile Scoring',
    'sales',
    true,
    1
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Lead & Contact Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-contact-engagement' || random()::text) from 1 for 8)),
    p.id,
    'Contact Engagement',
    'Emails & Phone Integration, Document Engagement, Zoom & Google Meet',
    'collaboration',
    true,
    2
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Contact Engagement');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-marketing' || random()::text) from 1 for 8)),
    p.id,
    'Marketing Automation',
    'Lists and Segments, Email Campaigns (1000 Emails/month), Email Campaign Reports, Autoresponders, Web to Lead Forms, Email Template Builder, Landing Pages, Short URLs',
    'marketing',
    true,
    3
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Marketing Automation');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-sales-pipeline' || random()::text) from 1 for 8)),
    p.id,
    'Sales Pipeline',
    'Deals and Contact Roles, Customize Sales Stages, Deal Kanban View, Idle Deal Alerts, Time Spent in every Stage',
    'sales',
    true,
    4
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Sales Pipeline');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Email to Case, First Response SLA, Resolution SLA, Business Hours',
    'support',
    true,
    5
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-mobile-app' || random()::text) from 1 for 8)),
    p.id,
    'Mobile App',
    'Real-time Notifications, Actions Page, Business Card Scanner, Leads/Contacts/Deals/Quotes/Cases, Voice Notes',
    'productivity',
    true,
    6
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Mobile App');

-- ONE GROWTH Features (Everything in Pilot plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-ai' || random()::text) from 1 for 8)),
    p.id,
    'AI Features',
    'Predictive AI, Generative AI, Natural Language Querying, AI Prompt Builder, AI Query Analytics, AI Chatbot, AI Bot Management',
    'ai',
    true,
    1
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'AI Features');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-lead-management' || random()::text) from 1 for 8)),
    p.id,
    'Lead Management',
    'Lead Auto-assignment & Routing',
    'sales',
    true,
    2
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Lead Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-action-center' || random()::text) from 1 for 8)),
    p.id,
    'Action Center',
    'Email tracking & real time notifications',
    'productivity',
    true,
    3
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Action Center');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-salesforce-automation' || random()::text) from 1 for 8)),
    p.id,
    'Salesforce Automation',
    'Multiple pipelines, Deal Playbooks',
    'sales',
    true,
    4
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Salesforce Automation');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-marketing-automation' || random()::text) from 1 for 8)),
    p.id,
    'Marketing Automation',
    'Campaigns, 5000 Emails/month or 500 Emails/user',
    'marketing',
    true,
    5
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Marketing Automation' AND category = 'marketing');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Organization matching with Email domain, Agent level business hours, Case satisfaction survey, Articles & FAQs, Customer Portal',
    'support',
    true,
    6
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk' AND category = 'support');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-inventory' || random()::text) from 1 for 8)),
    p.id,
    'Inventory Management',
    'Invoicing, Sales Order',
    'inventory',
    true,
    7
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Inventory Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-analytics' || random()::text) from 1 for 8)),
    p.id,
    'Reports & Analytics',
    'Customizable dashboards, Custom schedule reports',
    'analytics',
    true,
    8
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Reports & Analytics');

-- ONE PROFESSIONAL Features (Everything in Growth plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-salesforce-automation' || random()::text) from 1 for 8)),
    p.id,
    'Salesforce Automation',
    'Multiple Pipelines, Profile & Engagement Scoring, Lead Scoring, Sales Forecasting, Sales Quotas',
    'sales',
    true,
    1
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Salesforce Automation' AND category = 'sales');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-marketing-automation' || random()::text) from 1 for 8)),
    p.id,
    'Marketing Automation',
    '20,000 Emails/month or 2000 Emails/user, Unlimited Custom Email Templates, Image Storage, Autoresponder Email Campaigns, Scheduled Email Campaigns',
    'marketing',
    true,
    2
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Marketing Automation' AND category = 'marketing');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Social Ticketing, Round Robin Ticket Assignment, Least Loaded Ticket Assignment, Agent Level Business Hours, Service Contracts',
    'support',
    true,
    3
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk' AND category = 'support');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-conversations' || random()::text) from 1 for 8)),
    p.id,
    'Conversations',
    'Internal Team Collaboration, Live Web Chat',
    'collaboration',
    true,
    4
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Conversations');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-dashboards' || random()::text) from 1 for 8)),
    p.id,
    'Dashboards',
    'Sales Insights, Support Insights, Customizable Reports & Dashboards',
    'analytics',
    true,
    5
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Dashboards');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-inventory' || random()::text) from 1 for 8)),
    p.id,
    'Inventory Management',
    'Invoicing, Vendor Management, Purchase Order Management, Subscriptions, Payment Tracking, Sales Order, Assets',
    'inventory',
    true,
    6
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Inventory Management' AND category = 'inventory');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-project-management' || random()::text) from 1 for 8)),
    p.id,
    'Project Management',
    'Task dependencies (Finish to Start), Automated task end times (User business hours)',
    'project',
    true,
    7
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Project Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-process-designer' || random()::text) from 1 for 8)),
    p.id,
    'Process Designer',
    'Business Process Automation, Rules, Conditions, and Actions, Workflows and Approvals, Flowcharts, Tasks',
    'administration',
    true,
    8
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Process Designer');

-- ONE ENTERPRISE Features (Everything in Professional plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-contact-engagement' || random()::text) from 1 for 8)),
    p.id,
    'Contact Engagement',
    'Best Time to Contact',
    'sales',
    true,
    1
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Contact Engagement' AND category = 'sales');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-salesforce-automation' || random()::text) from 1 for 8)),
    p.id,
    'Salesforce Automation',
    'Multi Currencies',
    'sales',
    true,
    2
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Salesforce Automation' AND plan_id = p.id AND category = 'sales' AND description = 'Multi Currencies');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-internal-ticketing' || random()::text) from 1 for 8)),
    p.id,
    'Internal Ticketing',
    'Internal Ticketing system for employees, Internal ticket Insights',
    'support',
    true,
    3
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Internal Ticketing');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Work order management',
    'support',
    true,
    4
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk' AND plan_id = p.id AND description = 'Work order management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-project-management' || random()::text) from 1 for 8)),
    p.id,
    'Project Management',
    'Automated Time Tracking and Billing, Project key metrics and analytics, Project Templates',
    'project',
    true,
    5
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Project Management' AND category = 'project');

-- ONE AI Features (Everything in Enterprise plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('ai-built-in-ai' || random()::text) from 1 for 8)),
    p.id,
    'Built-IN AI',
    'Predictive AI, Generative AI, Natural Language Querying, Voice Assistants Integration, AI Prompt Builder, AI Query Analytics, AI Chatbot, AI Bot Management, Generative AI Designer, Predictive AI Designer',
    'ai',
    true,
    1
FROM plans p
WHERE p.plan_type = 'ai' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Built-IN AI');

-- ============================================================================
-- BOOSTER PACKS
-- ============================================================================

-- Extra Users Booster Pack
INSERT INTO booster_packs (id, internal_code, name, description, booster_pack_type, limit_type, limit_increase, limit_unit, monthly_price, annual_price, is_active, display_order)
SELECT 
    uuid_generate_v4(),
    'BSP-' || upper(substring(md5('extra-users' || random()::text) from 1 for 8)),
    'Extra Users Pack',
    'Add 10 additional users to your plan',
    'users',
    'users',
    10,
    'users',
    5.00,
    50.00,
    true,
    1
WHERE NOT EXISTS (SELECT 1 FROM booster_packs WHERE name = 'Extra Users Pack');

-- Storage Boost Booster Pack
INSERT INTO booster_packs (id, internal_code, name, description, booster_pack_type, limit_type, limit_increase, limit_unit, monthly_price, annual_price, is_active, display_order)
SELECT 
    uuid_generate_v4(),
    'BSP-' || upper(substring(md5('storage-boost' || random()::text) from 1 for 8)),
    'Storage Boost',
    'Add 50 GB of additional storage',
    'storage',
    'storage_gb',
    50,
    'GB',
    10.00,
    100.00,
    true,
    2
WHERE NOT EXISTS (SELECT 1 FROM booster_packs WHERE name = 'Storage Boost');

-- Email Boost Booster Pack
INSERT INTO booster_packs (id, internal_code, name, description, booster_pack_type, limit_type, limit_increase, limit_unit, monthly_price, annual_price, is_active, display_order)
SELECT 
    uuid_generate_v4(),
    'BSP-' || upper(substring(md5('email-boost' || random()::text) from 1 for 8)),
    'Email Boost',
    'Add 10,000 additional emails per month',
    'emails',
    'emails_per_month',
    10000,
    'emails/month',
    15.00,
    150.00,
    true,
    3
WHERE NOT EXISTS (SELECT 1 FROM booster_packs WHERE name = 'Email Boost');

