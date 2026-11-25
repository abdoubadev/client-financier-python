
# Journal des tests et incidents

## 1. Test de resistance a une injection SQL

**Objectif :** verifier qu'une saisie malveillante ne permet pas de modifier la requete SQL ni de recuperer toutes les societes.

**Tentative realisee :**

```text
' OR '1'='1
```

**Fonction testee :** `lister_societes()` dans `depot.py`.

La requete utilise une requete parametree :

```python
WHERE secteur = %s
curseur.execute(requete, (secteur,))
```

**Resultat obtenu :**

```text
Nombre de societes retournees : 0
Resultat : []
```

La tentative a echoue. La chaine saisie a ete traitee comme une valeur de recherche et non comme une instruction SQL. Aucune societe n'a ete retournee par cette tentative.

**Conclusion :** l'utilisation des parametres avec PyMySQL empeche cette injection SQL dans la fonction testee.

## 2. Erreur rencontree lors du lancement du test

**Erreur :** une premiere tentative d'execution avec `python -c` a provoque une erreur de syntaxe Python (`SyntaxError: '(' was never closed`).

**Cause :** conflit de guillemets et d'echappement entre la commande PowerShell et le code Python.

**Solution :** le test a ete relance dans l'interpreteur interactif Python, en executant les instructions separement. Le test a alors abouti au resultat attendu.
