-- =====================================================
-- Marketing Service Database Schema
-- Viridial SaaS - Marketing Automation System
-- =====================================================
-- Version: 1.0
-- Created: 2025-01-20
-- Description: Schéma complet pour le système d'automatisation marketing
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MARKETING LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'unsubscribed', 'bounced')),
    source VARCHAR(50) NOT NULL DEFAULT 'website' CHECK (source IN ('website', 'landing_page', 'form', 'import', 'api', 'referral', 'social', 'other')),
    custom_fields JSONB,
    score INTEGER NOT NULL DEFAULT 0,
    email_opened_count INTEGER NOT NULL DEFAULT 0,
    email_clicked_count INTEGER NOT NULL DEFAULT 0,
    is_unsubscribed BOOLEAN NOT NULL DEFAULT FALSE,
    unsubscribed_at TIMESTAMP,
    is_bounced BOOLEAN NOT NULL DEFAULT FALSE,
    last_contacted_at TIMESTAMP,
    organization_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketing_leads_email ON marketing_leads(email);
CREATE INDEX idx_marketing_leads_status ON marketing_leads(status);
CREATE INDEX idx_marketing_leads_source ON marketing_leads(source);
CREATE INDEX idx_marketing_leads_organization_id ON marketing_leads(organization_id);
CREATE INDEX idx_marketing_leads_score ON marketing_leads(score DESC);
CREATE INDEX idx_marketing_leads_created_at ON marketing_leads(created_at DESC);
CREATE INDEX idx_marketing_leads_custom_fields ON marketing_leads USING GIN(custom_fields);

-- =====================================================
-- 2. MARKETING SEGMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB, -- Filtres pour segmentation dynamique
    is_dynamic BOOLEAN NOT NULL DEFAULT FALSE,
    lead_count INTEGER NOT NULL DEFAULT 0,
    organization_id UUID NOT NULL,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_marketing_segments_organization_id ON marketing_segments(organization_id);
CREATE INDEX idx_marketing_segments_is_dynamic ON marketing_segments(is_dynamic);
CREATE INDEX idx_marketing_segments_filters ON marketing_segments USING GIN(filters);

-- =====================================================
-- 3. LEAD-SEGMENT JUNCTION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_lead_segments (
    lead_id UUID NOT NULL REFERENCES marketing_leads(id) ON DELETE CASCADE,
    segment_id UUID NOT NULL REFERENCES marketing_segments(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lead_id, segment_id)
);

CREATE INDEX idx_lead_segments_lead_id ON marketing_lead_segments(lead_id);
CREATE INDEX idx_lead_segments_segment_id ON marketing_lead_segments(segment_id);

-- =====================================================
-- 4. EMAIL TEMPLATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'custom' CHECK (category IN ('welcome', 'nurturing', 'promotional', 'transactional', 'abandoned_cart', 're_engagement', 'custom')),
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB, -- Variables disponibles dans le template
    preview_image VARCHAR(255),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    organization_id UUID NOT NULL,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_templates_category ON marketing_email_templates(category);
CREATE INDEX idx_email_templates_organization_id ON marketing_email_templates(organization_id);
CREATE INDEX idx_email_templates_is_default ON marketing_email_templates(is_default);

-- =====================================================
-- 5. MARKETING CAMPAIGNS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'email' CHECK (type IN ('email', 'sms', 'push', 'multi_channel')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    email_template_id UUID REFERENCES marketing_email_templates(id) ON DELETE SET NULL,
    segment_id UUID REFERENCES marketing_segments(id) ON DELETE SET NULL,
    subject VARCHAR(255),
    from_name TEXT,
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    total_recipients INTEGER NOT NULL DEFAULT 0,
    sent_count INTEGER NOT NULL DEFAULT 0,
    delivered_count INTEGER NOT NULL DEFAULT 0,
    opened_count INTEGER NOT NULL DEFAULT 0,
    clicked_count INTEGER NOT NULL DEFAULT 0,
    bounced_count INTEGER NOT NULL DEFAULT 0,
    unsubscribed_count INTEGER NOT NULL DEFAULT 0,
    organization_id UUID NOT NULL,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_campaigns_type ON marketing_campaigns(type);
CREATE INDEX idx_campaigns_organization_id ON marketing_campaigns(organization_id);
CREATE INDEX idx_campaigns_segment_id ON marketing_campaigns(segment_id);
CREATE INDEX idx_campaigns_scheduled_at ON marketing_campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- =====================================================
-- 6. MARKETING WORKFLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    trigger_type VARCHAR(50) NOT NULL DEFAULT 'lead_created' CHECK (trigger_type IN ('lead_created', 'lead_updated', 'form_submitted', 'email_opened', 'email_clicked', 'date_reached', 'manual')),
    trigger_conditions JSONB, -- Conditions pour déclencher le workflow
    segment_id UUID REFERENCES marketing_segments(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflows_status ON marketing_workflows(status);
CREATE INDEX idx_workflows_trigger_type ON marketing_workflows(trigger_type);
CREATE INDEX idx_workflows_organization_id ON marketing_workflows(organization_id);
CREATE INDEX idx_workflows_trigger_conditions ON marketing_workflows USING GIN(trigger_conditions);

-- =====================================================
-- 7. WORKFLOW STEPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES marketing_workflows(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('send_email', 'wait', 'update_lead', 'add_to_segment', 'remove_from_segment', 'condition')),
    "order" INTEGER NOT NULL, -- Ordre d'exécution (order est réservé en SQL, donc guillemets)
    email_template_id UUID REFERENCES marketing_email_templates(id) ON DELETE SET NULL,
    config JSONB, -- Configuration spécifique au type d'étape
    wait_duration INTEGER, -- Pour les étapes WAIT
    wait_duration_type VARCHAR(50) CHECK (wait_duration_type IN ('minutes', 'hours', 'days', 'weeks')),
    conditions JSONB, -- Pour les étapes CONDITION
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workflow_steps_workflow_id ON marketing_workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_order ON marketing_workflow_steps(workflow_id, "order");
CREATE INDEX idx_workflow_steps_type ON marketing_workflow_steps(type);

-- =====================================================
-- 8. EMAIL QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE SET NULL,
    lead_id UUID NOT NULL REFERENCES marketing_leads(id) ON DELETE CASCADE,
    email_template_id UUID REFERENCES marketing_email_templates(id) ON DELETE SET NULL,
    "to" VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    html_content TEXT NOT NULL,
    text_content TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'bounced')),
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    opened_at TIMESTAMP,
    clicked_at TIMESTAMP,
    open_count INTEGER NOT NULL DEFAULT 0,
    click_count INTEGER NOT NULL DEFAULT 0,
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    tracking_id UUID, -- Pour le pixel de tracking
    organization_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_queue_status ON marketing_email_queue(status);
CREATE INDEX idx_email_queue_lead_id ON marketing_email_queue(lead_id);
CREATE INDEX idx_email_queue_campaign_id ON marketing_email_queue(campaign_id);
CREATE INDEX idx_email_queue_organization_id ON marketing_email_queue(organization_id);
CREATE INDEX idx_email_queue_scheduled_at ON marketing_email_queue(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_email_queue_created_at ON marketing_email_queue(created_at);
CREATE INDEX idx_email_queue_tracking_id ON marketing_email_queue(tracking_id) WHERE tracking_id IS NOT NULL;

-- =====================================================
-- 9. LANDING PAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    html_content TEXT NOT NULL,
    metadata JSONB, -- SEO, meta tags, etc.
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    form_id UUID, -- Formulaire associé
    view_count INTEGER NOT NULL DEFAULT 0,
    conversion_count INTEGER NOT NULL DEFAULT 0,
    conversion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    organization_id UUID NOT NULL,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_landing_pages_slug ON marketing_landing_pages(slug);
CREATE INDEX idx_landing_pages_status ON marketing_landing_pages(status);
CREATE INDEX idx_landing_pages_organization_id ON marketing_landing_pages(organization_id);
CREATE INDEX idx_landing_pages_metadata ON marketing_landing_pages USING GIN(metadata);

-- =====================================================
-- 10. MARKETING FORMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'lead_capture' CHECK (type IN ('lead_capture', 'contact', 'newsletter', 'survey', 'custom')),
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive')),
    landing_page_id UUID REFERENCES marketing_landing_pages(id) ON DELETE SET NULL,
    settings JSONB, -- Paramètres du formulaire
    segment_id UUID, -- Segment auquel ajouter automatiquement les leads
    workflow_id UUID, -- Workflow à déclencher après soumission
    submission_count INTEGER NOT NULL DEFAULT 0,
    organization_id UUID NOT NULL,
    created_by_id UUID,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forms_type ON marketing_forms(type);
CREATE INDEX idx_forms_status ON marketing_forms(status);
CREATE INDEX idx_forms_organization_id ON marketing_forms(organization_id);
CREATE INDEX idx_forms_landing_page_id ON marketing_forms(landing_page_id);

-- =====================================================
-- 11. FORM FIELDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_form_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES marketing_forms(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL, -- Nom du champ (pour le mapping)
    type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio', 'number', 'date', 'url')),
    required BOOLEAN NOT NULL DEFAULT FALSE,
    placeholder TEXT,
    help_text TEXT,
    options JSONB, -- Pour les champs SELECT, RADIO, CHECKBOX
    "order" INTEGER NOT NULL, -- Ordre d'affichage
    validation JSONB, -- Règles de validation
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_fields_form_id ON marketing_form_fields(form_id);
CREATE INDEX idx_form_fields_order ON marketing_form_fields(form_id, "order");

-- =====================================================
-- 12. FORM SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_form_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES marketing_forms(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES marketing_leads(id) ON DELETE SET NULL,
    data JSONB NOT NULL, -- Données soumises
    ip_address VARCHAR(255),
    user_agent VARCHAR(255),
    referrer VARCHAR(50),
    organization_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_form_submissions_form_id ON marketing_form_submissions(form_id);
CREATE INDEX idx_form_submissions_lead_id ON marketing_form_submissions(lead_id);
CREATE INDEX idx_form_submissions_organization_id ON marketing_form_submissions(organization_id);
CREATE INDEX idx_form_submissions_created_at ON marketing_form_submissions(created_at DESC);
CREATE INDEX idx_form_submissions_data ON marketing_form_submissions USING GIN(data);

-- =====================================================
-- 13. MARKETING ANALYTICS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS marketing_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('page_view', 'email_sent', 'email_opened', 'email_clicked', 'email_bounced', 'email_unsubscribed', 'form_submitted', 'lead_created', 'lead_updated', 'conversion')),
    campaign_id UUID,
    lead_id UUID,
    workflow_id UUID,
    form_id UUID,
    landing_page_id UUID,
    metadata JSONB, -- Données supplémentaires de l'événement
    ip_address VARCHAR(255),
    user_agent VARCHAR(255),
    referrer VARCHAR(50),
    organization_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_event_type ON marketing_analytics(event_type);
CREATE INDEX idx_analytics_organization_id ON marketing_analytics(organization_id);
CREATE INDEX idx_analytics_created_at ON marketing_analytics(created_at DESC);
CREATE INDEX idx_analytics_campaign_id ON marketing_analytics(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_analytics_lead_id ON marketing_analytics(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_analytics_workflow_id ON marketing_analytics(workflow_id) WHERE workflow_id IS NOT NULL;
CREATE INDEX idx_analytics_form_id ON marketing_analytics(form_id) WHERE form_id IS NOT NULL;
CREATE INDEX idx_analytics_landing_page_id ON marketing_analytics(landing_page_id) WHERE landing_page_id IS NOT NULL;
CREATE INDEX idx_analytics_metadata ON marketing_analytics USING GIN(metadata);

-- =====================================================
-- TRIGGERS POUR UPDATED_AT AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Application des triggers sur toutes les tables avec updated_at
CREATE TRIGGER update_marketing_leads_updated_at BEFORE UPDATE ON marketing_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_segments_updated_at BEFORE UPDATE ON marketing_segments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON marketing_email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_workflows_updated_at BEFORE UPDATE ON marketing_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_steps_updated_at BEFORE UPDATE ON marketing_workflow_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON marketing_email_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON marketing_landing_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_forms_updated_at BEFORE UPDATE ON marketing_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at BEFORE UPDATE ON marketing_form_fields
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_submissions_updated_at BEFORE UPDATE ON marketing_form_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTIONS UTILES
-- =====================================================

-- Fonction pour calculer le taux de conversion d'une landing page
CREATE OR REPLACE FUNCTION calculate_landing_page_conversion_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE marketing_landing_pages
    SET conversion_rate = CASE
        WHEN view_count > 0 THEN (conversion_count::DECIMAL / view_count::DECIMAL) * 100
        ELSE 0
    END
    WHERE id = NEW.landing_page_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS POUR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE marketing_leads IS 'Table principale des leads marketing avec scoring et tracking des interactions';
COMMENT ON TABLE marketing_segments IS 'Segments de leads pour ciblage et campagnes';
COMMENT ON TABLE marketing_email_templates IS 'Templates d emails réutilisables pour campagnes et workflows';
COMMENT ON TABLE marketing_campaigns IS 'Campagnes marketing (email, SMS, push, etc.) avec statistiques';
COMMENT ON TABLE marketing_workflows IS 'Workflows d automatisation marketing déclenchés par événements';
COMMENT ON TABLE marketing_workflow_steps IS 'Étapes des workflows (email, attente, conditions, etc.)';
COMMENT ON TABLE marketing_email_queue IS 'File d attente des emails à envoyer avec tracking';
COMMENT ON TABLE marketing_landing_pages IS 'Landing pages avec tracking des conversions';
COMMENT ON TABLE marketing_forms IS 'Formulaires de capture de leads';
COMMENT ON TABLE marketing_form_fields IS 'Champs des formulaires avec validation';
COMMENT ON TABLE marketing_form_submissions IS 'Soumissions de formulaires avec données complètes';
COMMENT ON TABLE marketing_analytics IS 'Événements analytics pour tracking complet du marketing';

-- =====================================================
-- FIN DU SCHÉMA
-- =====================================================

