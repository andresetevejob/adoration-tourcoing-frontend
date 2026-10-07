L'utilisateur choisit son creneau d'adoration 
 Le système enregistre la reservation avec le statut en_cours de validation
etant donné que l'algorithme du système de reservation aligne la précision des créneaux horaires sur les heures piles (:00) ou des demis-heures (:30)

Pourquoi la serrure affiche-t-elle 06h30 à 07h30 ?

    Arrondi d'affichage TTLock : Sur la plupart des serrures et dans l'interface API / App, l'algorithme des passcodes de Version 4 tronque ou aligne la précision des créneaux horaires sur des paliers de 30 minutes (00 ou 30).

    L'arrondi de 06h57 : Les minutes 57 font basculer le début du créneau d'activation sur le bloc de 06h30.