
from db import get_connection
from modeles import Societe, BilanAnnuel, CoursBourse


def lister_societes(secteur=None):
    """Retourne la liste des sociétés, avec un filtre facultatif."""
    connexion = get_connection()

    try:
        with connexion.cursor() as curseur:
            if secteur:
                requete = """
                    SELECT id, nom, symbole_boursier, secteur, pays
                    FROM societe
                    WHERE secteur = %s
                    ORDER BY nom
                """
                curseur.execute(requete, (secteur,))
            else:
                requete = """
                    SELECT id, nom, symbole_boursier, secteur, pays
                    FROM societe
                    ORDER BY nom
                """
                curseur.execute(requete)

            lignes = curseur.fetchall()
            return [Societe(**ligne) for ligne in lignes]

    finally:
        connexion.close()


def obtenir_societe(societe_id):
    """Retourne une société à partir de son identifiant."""
    connexion = get_connection()

    try:
        with connexion.cursor() as curseur:
            requete = """
                SELECT id, nom, symbole_boursier, secteur, pays
                FROM societe
                WHERE id = %s
            """
            curseur.execute(requete, (societe_id,))
            ligne = curseur.fetchone()

            return Societe(**ligne) if ligne else None

    finally:
        connexion.close()


def ajouter_societe(societe):
    """Ajoute une société et retourne son identifiant."""
    connexion = get_connection()

    try:
        with connexion.cursor() as curseur:
            requete = """
                INSERT INTO societe
                (nom, symbole_boursier, secteur, pays)
                VALUES (%s, %s, %s, %s)
            """
            curseur.execute(
                requete,
                (
                    societe.nom,
                    societe.symbole_boursier,
                    societe.secteur,
                    societe.pays,
                ),
            )

            societe.id = curseur.lastrowid
            connexion.commit()

            return societe.id

    except Exception:
        connexion.rollback()
        raise

    finally:
        connexion.close()


def modifier_societe(societe_id, societe):
    """Modifie les informations d'une société existante."""
    connexion = get_connection()

    try:
        with connexion.cursor() as curseur:
            requete = """
                UPDATE societe
                SET nom = %s,
                    symbole_boursier = %s,
                    secteur = %s,
                    pays = %s
                WHERE id = %s
            """

            curseur.execute(
                requete,
                (
                    societe.nom,
                    societe.symbole_boursier,
                    societe.secteur,
                    societe.pays,
                    societe_id,
                ),
            )

            connexion.commit()
            return curseur.rowcount > 0

    except Exception:
        connexion.rollback()
        raise

    finally:
        connexion.close()


def supprimer_societe(societe_id):
    """Supprime une société à partir de son identifiant."""
    connexion = get_connection()

    try:
        with connexion.cursor() as curseur:
            requete = """
                DELETE FROM societe
                WHERE id = %s
            """

            curseur.execute(requete, (societe_id,))

            connexion.commit()
            return curseur.rowcount > 0

    except Exception:
        connexion.rollback()
        raise

    finally:
        connexion.close()


def lister_bilans(societe_id):
    """Retourne les bilans annuels d'une société."""
    connexion = get_connection()

    try:
        with connexion.cursor() as curseur:
            requete = """
                SELECT id, societe_id, annee, chiffre_affaires,
                       resultat_net, actifs_courants, passifs_courants,
                       dettes_totales, capitaux_propres, total_actifs
                FROM bilan_annuel
                WHERE societe_id = %s
                ORDER BY annee
            """
            curseur.execute(requete, (societe_id,))
            lignes = curseur.fetchall()

            return [BilanAnnuel(**ligne) for ligne in lignes]

    finally:
        connexion.close()


def lister_cours(societe_id, date_debut=None, date_fin=None):
    """Retourne les cours de bourse d'une société sur une période."""
    connexion = get_connection()

    try:
        requete = """
            SELECT id, societe_id, date_cours,
                   cours_cloture, volume_echange
            FROM cours_bourse
            WHERE societe_id = %s
        """
        parametres = [societe_id]

        if date_debut is not None:
            requete += " AND date_cours >= %s"
            parametres.append(date_debut)

        if date_fin is not None:
            requete += " AND date_cours <= %s"
            parametres.append(date_fin)

        requete += " ORDER BY date_cours"

        with connexion.cursor() as curseur:
            curseur.execute(requete, tuple(parametres))
            lignes = curseur.fetchall()

            return [CoursBourse(**ligne) for ligne in lignes]

    finally:
        connexion.close()
