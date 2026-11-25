
// ======================================================
// CLIENT FINANCIER
// Interface connectée à FastAPI et MariaDB
// ======================================================

const API_URL = "http://127.0.0.1:8000/api";

// Données chargées depuis l'API
let societes = [];
let bilans = [];
let coursBourse = [];

let idASupprimer = null;


// ======================================================
// 1. COMMUNICATION AVEC FASTAPI
// ======================================================

async function requeteAPI(url, options = {}) {
    const reponse = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers
        }
    });

    const texte = await reponse.text();
    const donnees = texte ? JSON.parse(texte) : null;

    if (!reponse.ok) {
        throw new Error(
            donnees?.detail || `Erreur HTTP ${reponse.status}`
        );
    }

    return donnees;
}


// ======================================================
// 2. CHARGEMENT DES DONNÉES DEPUIS MARIADB
// ======================================================

async function chargerDonnees() {
    societes = await requeteAPI(`${API_URL}/societes`);

    const resultats = await Promise.all(
        societes.map(async societe => {
            const [bilansSociete, coursSociete] = await Promise.all([
                requeteAPI(
                    `${API_URL}/societes/${societe.id}/bilans`
                ),
                requeteAPI(
                    `${API_URL}/societes/${societe.id}/cours`
                )
            ]);

            return {
                bilans: bilansSociete,
                cours: coursSociete
            };
        })
    );

    bilans = resultats.flatMap(resultat => resultat.bilans);
    coursBourse = resultats.flatMap(resultat => resultat.cours);

    afficherSocietes();
    actualiserListesSocietes();
    afficherBilans();
    afficherCours();
    actualiserDashboard();
}


// ======================================================
// 3. OUTILS ET FORMATAGE
// ======================================================

const formatNombre = valeur =>
    new Intl.NumberFormat("fr-FR").format(Number(valeur));

const formatMontant = valeur =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    }).format(Number(valeur));

const formatCours = valeur =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Number(valeur));

function obtenirNomSociete(id) {
    const societe = societes.find(s => s.id === Number(id));
    return societe ? societe.nom : "Société inconnue";
}

function obtenirSymbole(id) {
    const societe = societes.find(s => s.id === Number(id));
    return societe ? societe.symbole_boursier : "";
}


// ======================================================
// 4. NAVIGATION ENTRE LES PAGES
// ======================================================

const pages = {
    dashboard: {
        titre: "Tableau de bord",
        description: "Vue générale de votre environnement financier"
    },
    societes: {
        titre: "Sociétés",
        description: "Gestion des entreprises enregistrées"
    },
    bilans: {
        titre: "Bilans annuels",
        description: "Consultation des données comptables"
    },
    cours: {
        titre: "Cours de bourse",
        description: "Historique des cours et volumes échangés"
    },
    indicateurs: {
        titre: "Indicateurs financiers",
        description: "Analyse de la performance financière"
    }
};

document.querySelectorAll("[data-page]").forEach(lien => {
    lien.addEventListener("click", event => {
        event.preventDefault();

        const page = lien.dataset.page;

        document.querySelectorAll(".page-content").forEach(element => {
            element.classList.add("d-none");
        });

        const pageSelectionnee =
            document.getElementById(`page-${page}`);

        if (pageSelectionnee) {
            pageSelectionnee.classList.remove("d-none");
        }

        document.querySelectorAll("[data-page]").forEach(element => {
            element.classList.remove("active");
        });

        lien.classList.add("active");

        document.getElementById("titrePage").textContent =
            pages[page].titre;

        document.getElementById("descriptionPage").textContent =
            pages[page].description;
    });
});


// ======================================================
// 5. ÉLÉMENTS DES MODALES
// ======================================================

const modalSociete = new bootstrap.Modal(
    document.getElementById("modalSociete")
);

const modalSuppression = new bootstrap.Modal(
    document.getElementById("modalSuppression")
);

const formSociete = document.getElementById("formSociete");


// ======================================================
// 6. AFFICHER LES SOCIÉTÉS
// ======================================================

function afficherSocietes() {
    const liste = document.getElementById("listeSocietes");
    const compteur = document.getElementById("nombreSocietes");
    const messageVide = document.getElementById("messageVide");

    liste.innerHTML = "";
    compteur.textContent = societes.length;

    document.getElementById("dashboardSocietes").textContent =
        societes.length;

    if (societes.length === 0) {
        messageVide.classList.remove("d-none");
        return;
    }

    messageVide.classList.add("d-none");

    societes.forEach(societe => {
        const ligne = document.createElement("tr");

        const nom = document.createElement("td");
        const nomFort = document.createElement("strong");
        nomFort.textContent = societe.nom;
        nom.appendChild(nomFort);

        const symbole = document.createElement("td");
        symbole.textContent = societe.symbole_boursier;

        const secteur = document.createElement("td");
        secteur.textContent = societe.secteur;

        const pays = document.createElement("td");
        pays.textContent = societe.pays;

        const actions = document.createElement("td");
        actions.className = "actions-cell";

        const modifier = document.createElement("button");
        modifier.type = "button";
        modifier.className = "btn-action btn-edit";
        modifier.title = "Modifier";
        modifier.setAttribute("aria-label", "Modifier " + societe.nom);
        modifier.innerHTML = '<i class="bi bi-pencil"></i>';

        modifier.addEventListener("click", () => {
            modifierSociete(societe.id);
        });

        const supprimer = document.createElement("button");
        supprimer.type = "button";
        supprimer.className = "btn-action btn-delete";
        supprimer.title = "Supprimer";
        supprimer.setAttribute("aria-label", "Supprimer " + societe.nom);
        supprimer.innerHTML = '<i class="bi bi-trash"></i>';

        supprimer.addEventListener("click", () => {
            demanderSuppression(societe.id);
        });

        actions.append(modifier, supprimer);
        ligne.append(nom, symbole, secteur, pays, actions);
        liste.appendChild(ligne);
    });
}


// ======================================================
// 7. AJOUTER UNE SOCIÉTÉ
// ======================================================

document.getElementById("btnAjouterSociete").addEventListener(
    "click",
    () => {
        formSociete.reset();

        document.getElementById("societeId").value = "";

        document.getElementById("titreModalSociete").textContent =
            "Ajouter une société";

        document.getElementById("btnEnregistrerSociete").textContent =
            "Enregistrer";

        modalSociete.show();
    }
);


// ======================================================
// 8. AJOUTER OU MODIFIER VIA FASTAPI
// ======================================================

formSociete.addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("societeId").value;

    const societe = {
        nom: document.getElementById("nom").value.trim(),
        symbole_boursier: document
            .getElementById("symbole")
            .value.trim()
            .toUpperCase(),
        secteur: document.getElementById("secteur").value.trim(),
        pays: document.getElementById("pays").value.trim()
    };

    if (
        !societe.nom ||
        !societe.symbole_boursier ||
        !societe.secteur ||
        !societe.pays
    ) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    try {
        if (id) {
            await requeteAPI(`${API_URL}/societes/${id}`, {
                method: "PUT",
                body: JSON.stringify(societe)
            });
        } else {
            await requeteAPI(`${API_URL}/societes`, {
                method: "POST",
                body: JSON.stringify(societe)
            });
        }

        await chargerDonnees();

        modalSociete.hide();
        formSociete.reset();

        alert(id
            ? "Société modifiée avec succès."
            : "Société ajoutée avec succès.");

    } catch (erreur) {
        alert("Erreur : " + erreur.message);
    }
});


// ======================================================
// 9. MODIFIER UNE SOCIÉTÉ
// ======================================================

function modifierSociete(id) {
    const societe = societes.find(s => s.id === id);

    if (!societe) return;

    document.getElementById("societeId").value = societe.id;
    document.getElementById("nom").value = societe.nom;

    document.getElementById("symbole").value =
        societe.symbole_boursier;

    document.getElementById("secteur").value = societe.secteur;
    document.getElementById("pays").value = societe.pays;

    document.getElementById("titreModalSociete").textContent =
        "Modifier une société";

    document.getElementById("btnEnregistrerSociete").textContent =
        "Enregistrer les modifications";

    modalSociete.show();
}


// ======================================================
// 10. SUPPRIMER UNE SOCIÉTÉ VIA FASTAPI
// ======================================================

function demanderSuppression(id) {
    const societe = societes.find(s => s.id === id);

    if (!societe) return;

    idASupprimer = id;

    document.getElementById("nomSocieteSuppression").textContent =
        societe.nom;

    modalSuppression.show();
}

document.getElementById("btnConfirmerSuppression").addEventListener(
    "click",
    async () => {
        if (idASupprimer === null) return;

        try {
            await requeteAPI(
                `${API_URL}/societes/${idASupprimer}`,
                { method: "DELETE" }
            );

            idASupprimer = null;

            modalSuppression.hide();

            await chargerDonnees();

            alert("Société supprimée avec succès.");

        } catch (erreur) {
            alert("Erreur lors de la suppression : " + erreur.message);
        }
    }
);


// ======================================================
// 11. LISTES DÉROULANTES DES SOCIÉTÉS
// ======================================================

function actualiserListesSocietes() {
    const selecteurs = [
        "filtreBilanSociete",
        "filtreCoursSociete",
        "societeIndicateurs"
    ];

    selecteurs.forEach(id => {
        const select = document.getElementById(id);
        const ancienneValeur = select.value;

        select.innerHTML = "";

        const optionDefaut = document.createElement("option");
        optionDefaut.value = "";

        optionDefaut.textContent =
            id === "societeIndicateurs"
                ? "Sélectionner une société"
                : "Toutes les sociétés";

        select.appendChild(optionDefaut);

        societes.forEach(societe => {
            const option = document.createElement("option");

            option.value = societe.id;
            option.textContent =
                `${societe.nom} (${societe.symbole_boursier})`;

            select.appendChild(option);
        });

        if ([...select.options].some(o => o.value === ancienneValeur)) {
            select.value = ancienneValeur;
        }
    });
}


// ======================================================
// 12. AFFICHER LES BILANS ANNUELS
// ======================================================

function afficherBilans() {
    const liste = document.getElementById("listeBilans");

    const filtreSociete =
        document.getElementById("filtreBilanSociete").value;

    const filtreAnnee =
        document.getElementById("filtreBilanAnnee").value;

    liste.innerHTML = "";

    const resultats = bilans.filter(bilan => {
        const societeOK = !filtreSociete ||
            bilan.societe_id === Number(filtreSociete);

        const anneeOK = !filtreAnnee ||
            bilan.annee === Number(filtreAnnee);

        return societeOK && anneeOK;
    });

    if (resultats.length === 0) {
        liste.innerHTML = `
            <tr>
                <td colspan="8" class="text-center text-muted">
                    Aucun bilan trouvé.
                </td>
            </tr>`;
        return;
    }

    resultats.forEach(bilan => {
        const ligne = document.createElement("tr");

        const valeurs = [
            obtenirNomSociete(bilan.societe_id),
            bilan.annee,
            formatMontant(bilan.chiffre_affaires),
            formatMontant(bilan.resultat_net),
            formatMontant(bilan.actifs_courants),
            formatMontant(bilan.passifs_courants),
            formatMontant(bilan.dettes_totales),
            formatMontant(bilan.capitaux_propres)
        ];

        valeurs.forEach(valeur => {
            const cellule = document.createElement("td");
            cellule.textContent = valeur;
            ligne.appendChild(cellule);
        });

        liste.appendChild(ligne);
    });
}

document.getElementById("filtreBilanSociete").addEventListener(
    "change",
    afficherBilans
);

document.getElementById("filtreBilanAnnee").addEventListener(
    "change",
    afficherBilans
);


// ======================================================
// 13. AFFICHER LES COURS DE BOURSE
// ======================================================

function afficherCours() {
    const liste = document.getElementById("listeCours");

    const societeId =
        document.getElementById("filtreCoursSociete").value;

    const dateDebut =
        document.getElementById("dateDebutCours").value;

    const dateFin =
        document.getElementById("dateFinCours").value;

    liste.innerHTML = "";

    const resultats = coursBourse.filter(cours => {
        const societeOK = !societeId ||
            cours.societe_id === Number(societeId);

        const debutOK = !dateDebut ||
            cours.date_cours >= dateDebut;

        const finOK = !dateFin ||
            cours.date_cours <= dateFin;

        return societeOK && debutOK && finOK;
    });

    if (resultats.length === 0) {
        liste.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    Aucun cours trouvé.
                </td>
            </tr>`;
        return;
    }

    resultats.forEach(cours => {
        const ligne = document.createElement("tr");

        const valeurs = [
            obtenirNomSociete(cours.societe_id),
            new Date(cours.date_cours + "T00:00:00")
                .toLocaleDateString("fr-FR"),
            formatCours(cours.cours_cloture),
            formatNombre(cours.volume_echange)
        ];

        valeurs.forEach(valeur => {
            const cellule = document.createElement("td");
            cellule.textContent = valeur;
            ligne.appendChild(cellule);
        });

        liste.appendChild(ligne);
    });
}

document.getElementById("btnFiltrerCours").addEventListener(
    "click",
    afficherCours
);


// ======================================================
// 14. CALCUL DES INDICATEURS FINANCIERS
// ======================================================

function calculerMargeNette(resultatNet, chiffreAffaires) {
    if (chiffreAffaires === 0) return null;

    return (resultatNet / chiffreAffaires) * 100;
}

function calculerLiquidite(actifsCourants, passifsCourants) {
    if (passifsCourants === 0) return null;

    return actifsCourants / passifsCourants;
}

function calculerEndettement(dettesTotales, capitauxPropres) {
    if (capitauxPropres === 0) return null;

    return dettesTotales / capitauxPropres;
}

function calculerRendementBoursier(coursInitial, coursFinal) {
    if (coursInitial === 0) return null;

    return ((coursFinal - coursInitial) / coursInitial) * 100;
}

function calculerMoyenneMobile(cours, periode) {
    if (cours.length < periode) return null;

    const derniersCours = cours.slice(-periode);

    const somme = derniersCours.reduce(
        (total, valeur) => total + valeur,
        0
    );

    return somme / periode;
}


// ======================================================
// 15. AFFICHER LES INDICATEURS
// ======================================================

function afficherIndicateurs() {
    const societeId = Number(
        document.getElementById("societeIndicateurs").value
    );

    const annee = Number(
        document.getElementById("anneeIndicateurs").value
    );

    const message = document.getElementById("messageIndicateurs");

    if (!societeId) {
        message.textContent =
            "Sélectionnez une société pour commencer.";
        return;
    }

    const bilan = bilans.find(b =>
        b.societe_id === societeId &&
        b.annee === annee
    );

    if (!bilan) {
        message.textContent =
            "Aucun bilan disponible pour cette sélection.";
        return;
    }

    const marge = calculerMargeNette(
        bilan.resultat_net,
        bilan.chiffre_affaires
    );

    const liquidite = calculerLiquidite(
        bilan.actifs_courants,
        bilan.passifs_courants
    );

    const endettement = calculerEndettement(
        bilan.dettes_totales,
        bilan.capitaux_propres
    );

    const cours = coursBourse
        .filter(c => c.societe_id === societeId)
        .sort((a, b) => a.date_cours.localeCompare(b.date_cours));

    const prix = cours.map(c => Number(c.cours_cloture));

    const rendement = prix.length >= 2
        ? calculerRendementBoursier(
            prix[0],
            prix[prix.length - 1]
        )
        : null;

    const moyenne = calculerMoyenneMobile(prix, 5);

    document.getElementById("valeurMargeNette").textContent =
        marge === null ? "—" : marge.toFixed(2) + " %";

    document.getElementById("valeurLiquidite").textContent =
        liquidite === null ? "—" : liquidite.toFixed(2);

    document.getElementById("valeurEndettement").textContent =
        endettement === null ? "—" : endettement.toFixed(2);

    document.getElementById("valeurRendement").textContent =
        rendement === null ? "—" : rendement.toFixed(2) + " %";

    document.getElementById("valeurMoyenneMobile").textContent =
        moyenne === null ? "—" : formatCours(moyenne);

    message.textContent =
        `Analyse de ${obtenirNomSociete(societeId)} pour l'année ${annee}.`;
}

document.getElementById("btnCalculerIndicateurs").addEventListener(
    "click",
    afficherIndicateurs
);


// ======================================================
// 16. ACTUALISER LE TABLEAU DE BORD
// ======================================================

function actualiserDashboard() {
    const bilans2025 = bilans.filter(b => b.annee === 2025);

    const chiffreAffaires = bilans2025.reduce(
        (total, bilan) => total + Number(bilan.chiffre_affaires),
        0
    );

    const marges = bilans2025.map(b =>
        calculerMargeNette(
            Number(b.resultat_net),
            Number(b.chiffre_affaires)
        )
    ).filter(marge => marge !== null);

    const margeMoyenne = marges.length
        ? marges.reduce((total, valeur) => total + valeur, 0)
            / marges.length
        : 0;

    document.getElementById("chiffreAffairesTotal").textContent =
        formatMontant(chiffreAffaires);

    document.getElementById("margeNetteMoyenne").textContent =
        margeMoyenne.toFixed(2) + " %";

    document.getElementById("nombreCours").textContent =
        coursBourse.length;

    document.getElementById("dashboardBilans").textContent =
        bilans.length;

    document.getElementById("dashboardCours").textContent =
        coursBourse.length;

    document.getElementById("dashboardSocietes").textContent =
        societes.length;
}


// ======================================================
// 17. INITIALISATION DE L'APPLICATION
// ======================================================

async function initialiserApplication() {
    try {
        await chargerDonnees();
        console.log("Client Financier : données chargées depuis MariaDB.");
    } catch (erreur) {
        console.error("Erreur de chargement :", erreur);

        alert(
            "Impossible de charger les données depuis FastAPI.\n" +
            "Vérifiez que le serveur FastAPI est démarré.\n\n" +
            erreur.message
        );
    }
}

initialiserApplication();
