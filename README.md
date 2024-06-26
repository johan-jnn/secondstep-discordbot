# WTB Discord Bot

Robot Discord créé pour et par l'entreprise SecondStep.

Dans cette courte note va vous être présenté le robot à travers ses commandes et sa configuration.

## Table des matières

- [WTB Discord Bot](#wtb-discord-bot)
  - [Table des matières](#table-des-matières)
  - [Commandes](#commandes)
    - [/wtb](#wtb)
    - [/webhooks](#webhooks)
      - [/webhooks add](#webhooks-add)
      - [/webhooks delete](#webhooks-delete)
      - [/webhooks list](#webhooks-list)
  - [Paramétrage du robot](#paramétrage-du-robot)
    - [Identifiants](#identifiants)
    - [Moderators](#moderators)
    - [Guild](#guild)
  - [Auteur](#auteur)

## Commandes

Afin de sécuriser la création des commandes, celles-ci sont uniquement utilisables dans le serveur discord associé à l'ID paramétré dans le fichier prévu à cet effet (plus d'informations sur ce fichier [plus bas dans la documentation](#paramétrage-du-robot)).

### /wtb

Permet de créer un nouveau WantToBuy. A la suite de l'envoi la commande, un formulaire vous sera présenté. Une fois le formulaire validé, la commande sera crée dans [le salon prévu à cet effet](#guild).

### /webhooks

Permet de gérer les webhooks. Cette commande possède des sous-commandes afin de mieux catégoriser les actions :

#### /webhooks add

Permet d'ajouter un webhook. Un argument `webhook-url` vous sera demandé. A savoir que l'URL du webhook sera vérifiée.

#### /webhooks delete

Permet de supprimer un webhook. Un argument `id` vous sera demandé. Cette argument correspond au chiffre après le `#` lorsque vous [liser les webhooks disponibles](#webhooks-list).

#### /webhooks list

Permet de lister tous les webhooks actifs.

## Paramétrage du robot

Les différents comportements et paramètres du robot sont configurable dans le fichier `settings.yaml` à la racine des fichiers du robot.
Le système [yaml](https://dev.to/kalkwst/a-gentle-introduction-to-the-yaml-format-bi6) est un système de stockage d'information basé sur des clefs/valeurs. Pour faire au plus simple, chaques paramètres et comportements du robot est écrit sous ce forma :

```yaml
clef: valeur
clef:
  sous-clef: valeur

clef:
  - liste
  - de
  - valeur
```

Les valeurs peuvent être du texte (à mettre en guillemets entrant et fermant), des nombres ou des boolean (`yes` ou `no`).

Si vous souhaitez mettre une liste vide de valeur, utilisez la valeur `[]`.
Si vous souhaitez mettre des sous-clef/valeurs vides, utilisez la valeur `{}`.

### Identifiants

Vous trouverez dans la suite des valeurs appelé "_identifiant_" ou encore "_id_". Ce sont des valeurs (une série de 12 à 19 chiffres sans espaces; par exemple: `51694861681848894`) fixes qui permettent de sélectionner plus facilement n'importe quel type de données sur Discord (_Utilisateurs_, _Rôles_, _Serveur_, etc...).

Les identifiants sont récupérable en [activant le mode développeur](https://wiki.discord-france.fr/utilisateur/parametres-application/mode-developpeur/) et en faisant `CLIQUE-DROIT -> COPIER L'IDENTIFIANT` sur l'élément où copier l'identifiant (_Utilisateurs_, _Rôles_, _Serveur_, etc...).
**A savoir que l'identifiant doit être mis entre guillemets dans les valeurs !**

Voyons à présent la liste des paramètres obligatoires (ou non **si indiqué**) valides pour le robot :

### Moderators

Cette clef permet de paramétrer les utilisateurs/rôles qui sont définis comme les "moderateurs" du robot. A savoir que seul les modérateurs peuvent faire les actions suivantes :

- Créer des WTB (via la commande [`/wtb`](#wtb))
- Supprimer (fermer) les tickets
- Gérer (créer, supprimer, lister) les webhooks

Voici la syntax à adopter :

```yaml
moderators:
    users: [] # Listes des identifiants utilisateurs défini comme "modérateur"
    roles: [] # Listes des identifiants des rôles défini comme "modérateur"
```

### Guild

Cette clef permet d'asigner les différentes fonctions du robot au serveur et aux différents salons du serveurs.

Voici la syntax à adopter :

```yaml
guild:
    id: "" # Identifiant du serveur SecondStep
    channels:
        wtb: "" # Identifiant du salon où apparaitront tous les tickets ouverts
    categories:
        closed_tickets: "" # Identifiant de la catégorie où seront retranscrit toutes les commandes qui ont été fermés (avec les threads, messages et informations de la paire)
```

## Auteur

Ce robot a été créé par Johan avec l'ensemble de l'équipe du pôle dev.
Plus d'informations sur ses projets [sur son site web](https://johan-janin.com/portfolio).
