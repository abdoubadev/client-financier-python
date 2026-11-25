from decimal import Decimal

from depot import (
    lister_societes,
    lister_bilans,
    lister_cours,
)
from indicateurs import (
    calculer_marge_nette,
    calculer_liquidite,
    calculer_endettement,
    calculer_rendement_boursier,
    calculer_moyenne_mobile,
)


def afficher_demo():
    print("=" * 55)
    print("       APPLICATION DE DEMONSTRATION FINANCIERE")
    print("=" * 55)

    societes = lister_societes()

    if not societes:
        print("Aucune société disponible.")
        return

    print("\nSociétés disponibles :")

    for societe in societes:
        print(
            f"{societe.id} - {societe.nom} "
            f"({societe.symbole_boursier})"
        )

    choix = input("\nIdentifiant de la société à analyser : ")

    try:
        societe_id = int(choix)
    except ValueError:
        print("Veuillez saisir un identifiant numérique.")
        return

    societe = next(
        (s for s in societes if s.id == societe_id),
        None
    )

    if societe is None:
        print("Société introuvable.")
        return

    print(f"\nAnalyse financière : {societe.nom}")
    print("-" * 55)

    bilans = lister_bilans(societe.id)

    if bilans:
        bilan = bilans[-1]

        print(f"\nDernier bilan disponible : {bilan.annee}")

        try:
            marge = calculer_marge_nette(
                bilan.resultat_net,
                bilan.chiffre_affaires
            )
            liquidite = calculer_liquidite(
                bilan.actifs_courants,
                bilan.passifs_courants
            )
            endettement = calculer_endettement(
                bilan.dettes_totales,
                bilan.capitaux_propres
            )

            print(f"Marge nette : {marge:.2f} %")
            print(f"Ratio de liquidité : {liquidite:.2f}")
            print(f"Ratio d'endettement : {endettement:.2f}")

        except (ValueError, ZeroDivisionError) as erreur:
            print(f"Calcul impossible : {erreur}")
    else:
        print("\nAucun bilan annuel disponible.")

    cours = lister_cours(societe.id)

    if len(cours) >= 2:
        rendement = calculer_rendement_boursier(
            cours[0].cours_cloture,
            cours[-1].cours_cloture
        )

        print("\nAnalyse boursière :")
        print(f"Premier cours : {cours[0].cours_cloture}")
        print(f"Dernier cours : {cours[-1].cours_cloture}")
        print(f"Rendement : {rendement:.2f} %")

        periode = min(5, len(cours))

        prix = [c.cours_cloture for c in cours]

        moyenne = calculer_moyenne_mobile(prix, periode)

        print(
            f"Moyenne mobile sur {periode} cours : "
            f"{moyenne:.2f}"
        )
    else:
        print("\nNombre de cours insuffisant pour l'analyse boursière.")

    print("\n" + "=" * 55)
    print("Fin de la démonstration.")


if __name__ == "__main__":
    afficher_demo()
