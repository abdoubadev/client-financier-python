
// ======================================================
// CLIENT FINANCIER
// Gestion des sociétés, bilans, cours et indicateurs
// Données temporaires de démonstration
// ======================================================


// ======================================================
// 1. DONNÉES DES SOCIÉTÉS
// ======================================================

let societes = [
    { id: 1, nom: "NovaTech", symbole: "NVT", secteur: "Technologie", pays: "France" },
    { id: 2, nom: "GreenEnergy", symbole: "GRE", secteur: "Energie", pays: "Allemagne" },
    { id: 3, nom: "MediCare Plus", symbole: "MCP", secteur: "Sante", pays: "Belgique" },
    { id: 4, nom: "AutoMotion", symbole: "ATM", secteur: "Automobile", pays: "France" }
];

let prochainId = 5;
let idASupprimer = null;


// ======================================================
// 2. DONNÉES DES BILANS ANNUELS
// ======================================================

// Les chiffres d'affaires 2025 sont ceux du jeu de données.
// Les autres montants sont provisoires pour la démonstration.

let bilans = [];

const donneesFinancieres = [
    {
        id: 1,
        ca2025: 10500000,
        resultat2025: 1260000,
        actifs2025: 4200000,
        passifs2025: 2800000,
        dettes2025: 3500000,
        capitaux2025: 5000000,
        total2025: 8500000
    },
    {
        id: 2,
        ca2025: 15000000,
        resultat2025: 1800000,
        actifs2025: 6000000,
        passifs2025: 3500000,
        dettes2025: 5000000,
        capitaux2025: 7000000,
        total2025: 12000000
    },
    {
        id: 3,
        ca2025: 8100000,
        resultat2025: 810000,
        actifs2025: 3200000,
        passifs2025: 2100000,
        dettes2025: 2800000,
        capitaux2025: 4200000,
        total2025: 7000000
    },
    {
        id: 4,
        ca2025: 21000000,
        resultat2025: 2100000,
        actifs2025: 7500000,
        passifs2025: 4300000,
        dettes2025: 6500000,
        capitaux2025: 9000000,
        total2025: 15500000
    }
];

function genererBilans() {
    const facteurs = {
        2023: 0.78,
        2024: 0.88,
        2025: 1
    };

    donneesFinancieres.forEach(d => {
        [2023, 2024, 2025].forEach(annee => {
            const facteur = facteurs[annee];

            bilans.push({
                societe_id: d.id,
                annee: annee,
                chiffre_affaires: Math.round(d.ca2025 * facteur),
                resultat_net: Math.round(d.resultat2025 * facteur),
                actifs_courants: Math.round(d.actifs2025 * facteur),
                passifs_courants: Math.round(d.passifs2025 * facteur),
                dettes_totales: Math.round(d.dettes2025 * facteur),
                capitaux_propres: Math.round(d.capitaux2025 * facteur),
                total_actifs: Math.round(d.total2025 * facteur)
            });
        });
    });
}

genererBilans();


// ======================================================
// 3. DONNÉES DES COURS DE BOURSE
// ======================================================

// Moyennes de cours connues pour chaque société.
// Les cours individuels ci-dessous sont provisoires.

let coursBourse = [];

const donneesCours = [
    { id: 1, prix: [125, 126, 127, 128, 129, 130, 130, 131, 132, 134.8] },
    { id: 2, prix: [84, 85, 86, 87, 87, 88, 88, 89, 89, 87] },
    { id: 3, prix: [55, 56, 57, 57, 58, 59, 59, 60, 60, 56.8] },
    { id: 4, prix: [100, 101, 102, 103, 104, 105, 106, 107, 108, 111.9] }
];

function genererCours() {
    donneesCours.forEach(d => {
        d.prix.forEach((prix, index) => {
            const jour = String(index + 2).padStart(2, "0");

            coursBourse.push({
                societe_id: d.id,
                date_cours: `2026-11-${jour}`,
                cours_cloture: prix,
                volume_echange: 10000 + (index * 1250) + (d.id * 500)
            });
        });
    });
}

genererCours();


// ======================================================
// 4. OUTILS ET FORMATAGE
// ======================================================

const formatNombre = valeur =>
    new Intl.NumberFormat("fr-FR").format(valeur);

const formatMontant = valeur =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0
    }).format(valeur);

const formatCours = valeur =>
    new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valeur);

function obtenirNomSociete(id) {
    const societe = societes.find(s => s.id === Number(id));
    return societe ? societe.nom : "Société inconnue";
}

function obtenirSymbole(id) {
    const societe = societes.find(s => s.id === Number(id));
    return societe ? societe.symbole : "";
}


// ======================================================
// 5. NAVIGATION ENTRE LES PAGES
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

        const pageSelectionnee = document.getElementById(`page-${page}`);

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
// 6. ÉLÉMENTS DES MODALES
// ======================================================

const modalSociete = new bootstrap.Modal(
    document.getElementById("modalSociete")
);

const modalSuppression = new bootstrap.Modal(
    document.getElementById("modalSuppression")
);

const formSociete = document.getElementById("formSociete");


// ======================================================
// 7. AFFICHER LES SOCIÉTÉS
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
        symbole.textContent = societe.symbole;

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
        modifier.addEventListener("click", () => modifierSociete(societe.id));

        const supprimer = document.createElement("button");
        supprimer.type = "button";
        supprimer.className = "btn-action btn-delete";
        supprimer.title = "Supprimer";
        supprimer.setAttribute("aria-label", "Supprimer " + societe.nom);
        supprimer.innerHTML = '<i class="bi bi-trash"></i>';
        supprimer.addEventListener("click", () => demanderSuppression(societe.id));

        actions.append(modifier, supprimer);

        ligne.append(nom, symbole, secteur, pays, actions);
        liste.appendChild(ligne);
    });

    actualiserListesSocietes();
}


// ======================================================
// 8. AJOUTER UNE SOCIÉTÉ
// ======================================================

document.getElementById("btnAjouterSociete").addEventListener("click", () => {
    formSociete.reset();

    document.getElementById("societeId").value = "";
    document.getElementById("titreModalSociete").textContent =
        "Ajouter une société";

    document.getElementById("btnEnregistrerSociete").textContent =
        "Enregistrer";

    modalSociete.show();
});


// ======================================================
// 9. ENREGISTRER OU MODIFIER UNE SOCIÉTÉ
// ======================================================

formSociete.addEventListener("submit", event => {
    event.preventDefault();

    const id = document.getElementById("societeId").value;

    const societe = {
        nom: document.getElementById("nom").value.trim(),
        symbole: document.getElementById("symbole").value.trim().toUpperCase(),
        secteur: document.getElementById("secteur").value.trim(),
        pays: document.getElementById("pays").value.trim()
    };

    if (!societe.nom || !societe.symbole || !societe.secteur || !societe.pays) {
        alert("Veuillez remplir tous les champs.");
        return;
    }

    if (id) {
        const index = societes.findIndex(s => s.id === Number(id));

        if (index !== -1) {
            societes[index] = {
                id: Number(id),
                ...societe
            };
        }
    } else {
        societes.push({
            id: prochainId++,
            ...societe
        });
    }

    afficherSocietes();
    modalSociete.hide();
    formSociete.reset();
});


// ======================================================
// 10. MODIFIER UNE SOCIÉTÉ
// ======================================================

function modifierSociete(id) {
    const societe = societes.find(s => s.id === id);

    if (!societe) return;

    document.getElementById("societeId").value = societe.id;
    document.getElementById("nom").value = societe.nom;
    document.getElementById("symbole").value = societe.symbole;
    document.getElementById("secteur").value = societe.secteur;
    document.getElementById("pays").value = societe.pays;

    document.getElementById("titreModalSociete").textContent =
        "Modifier une société";

    document.getElementById("btnEnregistrerSociete").textContent =
        "Enregistrer les modifications";

    modalSociete.show();
}


// ======================================================
// 11. SUPPRESSION D'UNE SOCIÉTÉ
// ======================================================

function demanderSuppression(id) {
    const societe = societes.find(s => s.id === id);

    if (!societe) return;

    idASupprimer = id;

    document.getElementById("nomSocieteSuppression").textContent =
        societe.nom;

    modalSuppression.show();
}

document.getElementById("btnConfirmerSuppression").addEventListener("click", () => {
    if (idASupprimer === null) return;

    societes = societes.filter(s => s.id !== idASupprimer);

    bilans = bilans.filter(b => b.societe_id !== idASupprimer);
    coursBourse = coursBourse.filter(c => c.societe_id !== idASupprimer);

    idASupprimer = null;

    afficherSocietes();
    afficherBilans();
    afficherCours();
    actualiserListesSocietes();

    modalSuppression.hide();
});


// ======================================================
// 12. LISTES DÉROULANTES DES SOCIÉTÉS
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
            option.textContent = `${societe.nom} (${societe.symbole})`;
            select.appendChild(option);
        });

        if ([...select.options].some(o => o.value === ancienneValeur)) {
            select.value = ancienneValeur;
        }
    });
}


// ======================================================
// 13. AFFICHER LES BILANS ANNUELS
// ======================================================

function afficherBilans() {
    const liste = document.getElementById("listeBilans");
    const filtreSociete = document.getElementById("filtreBilanSociete").value;
    const filtreAnnee = document.getElementById("filtreBilanAnnee").value;

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

document.getElementById("filtreBilanSociete").addEventListener("change", afficherBilans);
document.getElementById("filtreBilanAnnee").addEventListener("change", afficherBilans);


// ======================================================
// 14. AFFICHER LES COURS DE BOURSE
// ======================================================

function afficherCours() {
    const liste = document.getElementById("listeCours");

    const societeId = document.getElementById("filtreCoursSociete").value;
    const dateDebut = document.getElementById("dateDebutCours").value;
    const dateFin = document.getElementById("dateFinCours").value;

    liste.innerHTML = "";

    const resultats = coursBourse.filter(cours => {
        const societeOK = !societeId ||
            cours.societe_id === Number(societeId);

        const debutOK = !dateDebut || cours.date_cours >= dateDebut;
        const finOK = !dateFin || cours.date_cours <= dateFin;

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
            new Date(cours.date_cours + "T00:00:00").toLocaleDateString("fr-FR"),
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

document.getElementById("btnFiltrerCours").addEventListener("click", afficherCours);


// ======================================================
// 15. FONCTIONS DE CALCUL DES INDICATEURS
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
// 16. AFFICHER LES INDICATEURS FINANCIERS
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
        message.textContent = "Sélectionnez une société pour commencer.";
        return;
    }

    const bilan = bilans.find(b =>
        b.societe_id === societeId &&
        b.annee === annee
    );

    if (!bilan) {
        message.textContent = "Aucun bilan disponible pour cette sélection.";
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

    const prix = cours.map(c => c.cours_cloture);

    const rendement = prix.length >= 2
        ? calculerRendementBoursier(prix[0], prix[prix.length - 1])
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
// 17. ACTUALISER LE TABLEAU DE BORD
// ======================================================

function actualiserDashboard() {
    const bilans2025 = bilans.filter(b => b.annee === 2025);

    const chiffreAffaires = bilans2025.reduce(
        (total, bilan) => total + bilan.chiffre_affaires,
        0
    );

    const marges = bilans2025.map(b =>
        calculerMargeNette(b.resultat_net, b.chiffre_affaires)
    );

    const margeMoyenne = marges.length
        ? marges.reduce((total, valeur) => total + valeur, 0) / marges.length
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
}


// ======================================================
// 18. INITIALISATION DE L'APPLICATION
// ======================================================

function initialiserApplication() {
    afficherSocietes();

    actualiserListesSocietes();

    afficherBilans();
    afficherCours();

    actualiserDashboard();
}

initialiserApplication();
