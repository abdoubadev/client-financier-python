-- ============================================================
-- 002_ajout_devise.sql
-- Migration : ajout de la devise dans la table societe
-- Valeur par defaut : EUR
-- ============================================================

ALTER TABLE societe
ADD COLUMN devise VARCHAR(3) NOT NULL DEFAULT 'EUR';

-- Verification de la migration
DESCRIBE societe;

SELECT id, nom, symbole_boursier, devise
FROM societe
ORDER BY id;
