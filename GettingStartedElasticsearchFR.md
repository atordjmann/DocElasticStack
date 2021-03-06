# DOCUMENTATION ELASTICSEARCH : GETTING STARTED


##Concepts de base
**Near Realtime (NRT)** : Elasticsearch est une plateforme de recherché “near realtime” : il y a un léger temps de latence (normalement 1 seconde) entre le temps d’indexation d’un document et le temps où l’on peut réellement le chercher.

**Cluster** : un cluster est une collection d’un ou plusieurs nœuds (servers) qui ensembles contiennent toutes les données et fournit une indexation ainsi qu’une capacité de recherche à travers tous les nœuds.  Un cluster est identifié par un nom unique, qui est par défaut « elasticsearch ». Un nœud ne peut faire partie d’un cluster que s’il est configuré pour joindre le cluster portant son nom. Il ne faut donc pas donner un même nom à des clusters différents.

**Node** : un nœud est un unique server qui fait partie du cluster. Il stocke les données et participe à l’indexation et capacité de recherche du cluster. Un nœud est identifié par son nom, qui est par défaut un identifiant unique (UUID). Le nom est important pour des causes d’administration, quand on veut identifier quel server dans notre network correspond à quel nœud dans le cluster Elasticsearch.
**Index** : un index est une collection de documents qui ont des caractéristiques similaires, identifié par un nom. Ce nom est utilisé pour se référer à l’index lorsqu’on indexe, recherche, modifie ou supprime des données dans un document composant l’index.

**Document** : un document est une unité basique d’informations qui peut être indexé. Ce document est dans le format JSON.

**Shards & Replicas** : Un index peut potentiellement stocker un grand nombre de données, et ainsi les requêtes peuvent être trop longues à aboutir avec un seul nœud. Pour résoudre ce problème, Elasticsearch permet de découper l’index en de multiples parties, appelées « shards ». On peut spécifier le nombre de shards que l’on veut lorsqu’on crée un index. Chaque shard est un index indépendant et totalement fonctionnel, qui peut être dans n’importe quel nœud du cluster. Les shards permettent de distribuer et paralléliser les opérations et ainsi augmenter la performance. Il est possible de répliquer les shards.

##Explorer le cluster
**The REST API** : après avoir un nœud et un cluster, il faut communiquer avec. Elasticsearch fournit une REST API pour pouvoir interagir avec le cluster.
**Cluster Health**
Pour vérifier l’état de santé d’un cluster, on utilise l’API \_cat :` GET /_cat/health ?v`
Pour obtenir la liste des nœuds d’un cluster : `GET /_cat/nodes ?v`
Le statut est vers lorsque tout va bien, jaune lorsque toutes les données sont disponibles mais des répliques ne sont pas encore allouées, rouge lorsque des données ne sont pas disponibles.
Lister tous les indices
`GET /_cat/indices ?v`
**Créer un Index**
Par exemple pour créer un index nommé « customer » : `PUT/customer ?pretty`
On utilise le mot clé pretty à la fin de l’appel pour dire à Elasticsearch de « pretty-print » la réponse JSON s’il y en a une.
**Indexer et requêter un document**
Pour ajouter un document dans notre index « customer » avec un ID de 1 : 
`PUT /customer/_doc/1 ?pretty { « name » : « John Doe » }`
Pour le récupérer à l’aide de son ID : `GET /customer/_doc/1 ?pretty`
**Supprimer un index**
`DELETE /customer ?pretty`
**Modèle de requête**
Ainsi le modèle pour accéder à des données dans Elasticsearch peut être résumé comme : `<HTTP Verb> /<Index>/<Type>/<ID>`

## Modifier les données
Si l’on crée un nouveau document avec le même ID qu’un document existant, cela le réindexe avec les nouvelles données. Si lors de la création d’un document, on ne mentionne pas l’ID, Elasticsearch le fera automatiquement. Mais il faut alors utiliser POST au lieu de PUT.
Mettre à jour un document
Elasticsearch ne fait pas de mise à jour « in-place », il supprime l’ancien document et indexe un nouveau avec les changements appliqués.
Exemples : 
```
POST /customer/_doc/1/_update?pretty    {  "doc": { "name": "Jane Doe" } }
POST /customer/_doc/1/_update?pretty    {  "doc": { "name": "Jane Doe", "age": 20 } }
POST /customer/_doc/1/_update?pretty    {  "script" : "ctx._source.age += 5"}
```
Le dernier exemple utilise un script pour incrémenter l’age par 5, avec ctx.\_source qui se réfère au document actuel qui va être modifié.
On peut également modifier plusieurs documents à la fois en utilisant une requête (see docs-update-by-query API). 
**Supprimer un document**
`DELETE /customer/_doc/2 ?pretty`
On peut utiliser également des requêtes (see \_delete_by_query API).
**Batch processing**
Il est possible de lancer plusieurs requêtes en même temps en utilisant la \_bulk API.
Par exemple :
```
POST /customer/_doc/_bulk?pretty
{"index":{"_id":"1"}}
{"name": "John Doe" }
{"index":{"_id":"2"}}
{"name": "Jane Doe" }

POST /customer/_doc/_bulk?pretty
{"update":{"_id":"1"}}
{"doc": { "name": "John Doe becomes Jane Doe" } }
{"delete":{"_id":"2"}}
```
## Explorer les données
**The Search API**
Pour faire des recherches on peut les envoyer au REST request URI ou au REST request body. Le deuxième permet d’être plus expressif et de définir les recherches dans un format JSON plus lisible.
Exemple avec request URI :
`GET /bank/_search?q=*&sort=account_number:asc&pretty`
Puis avec request body:
```
GET /bank/_search 
{   "query": 
{ "match_all": {} },   
     "sort": [     { "account_number": "asc" }   ] }
```
“q” correspond ainsi à “query”

**Introduction au langage de requête**
Rendre tous les documents de l’index : 
```
GET /bank/_search    
{   "query": { "match_all": {} } }
```
On peut mettre d’autres paramètres, comme par exemple la taille (par défaut 10), ou l’index à partir duquel chercher :
```
GET /bank/_search   
{   "query": { "match_all": {} },   
    "from": 10,   
    "size": 10 }
```
**Rechercher**
Par défaut, lors de la recherche d’un document, la totalité du fichier JSON est renvoyée. Mais il est possible de sélectionner des champs avec le paramètre \_source : 
```
GET /bank/_search   
{   "query": { "match_all": {} },   
    "_source": ["account_number", "balance"] }
```
On peut sélectionner des données correspondants à une requêtes, comme par exemple rendre les enregistrements avec un account_number de 20 : 
```
GET /bank/_search  
{    "query": 
{ "match": { "account_number": 20 } }  }
```
Ou des comptes contents le terme mill ou lane dans l’adresse : 
```
GET /bank/_search  
{    "query": 
{ "match": { "address": "mill lane" } }  }
```
Ou contenant la phrase “mill lane” :
```
GET /bank/_search  
{   "query": 
{ "match_phrase": { "address": "mill lane" } } }
```
Ou contenant mill et lane dans l’adresse, avec deux matchs : 
```
GET /bank/_search 
{   "query": {     
"bool": {
       "must": [         { "match": { "address": "mill" } },
         				{ "match": { "address": "lane" } }       ]     }  }}
```
Pour avoir les deux, il suffit de remplacer must par should. Pour obtenir le contraire, il faut ajouter \_not au mot (par exemple must_not).
Filter
Le champ \_score, est une mesure permettant de savoir à quell point un document correspond à une requête. Mais on n’en a pas besoin si l’on souhaite seulement filtrer.
Exemple de filtre : render un compte avec un solde entre 20000 and 30000.
```
GET /bank/_search 
{   "query": { 
    "bool": {
       		"must": { "match_all": {} },
       		"filter": {
  			"range": {          
 				"balance": {"gte": 20000,  "lte": 30000   }   }      }    }  }} 
```
Quelle est la différence entre une requête et un filtre ? 
requête -> pour installer le contexte, 
filtre -> donner les sous-ensembles.
**Agrégations**
Les agrégations permettent de grouper et extraire des statistiques des données. C’est comme une requête SQL GROUP BY.
Il est possible de faire des aggrégation au sein d’aggrégations. Par exemple, pour calculer le solde moyen par état:
```
GET /bank/_search  
{   "size": 0,   
"aggs": {
     "group_by_state": {
       	"terms": {"champ":  state.keyword"       },
      		"aggs": {
        			"average_balance": {
           			"avg": {  "champ": "balance" }         }       }     }    } }
```

## API Conventions
**Multiples indices**
Il est possible de faire des opérations sur des indices multiples, en utilisant par exemple les notations : « test1, test2, test3 », « \_all », « test* », « te*st ». On peut également exclure : « test*, -test3 ».
Il y a également des paramètres de requête url comme : ignore_unavailable, allow_no_indice, expand_wildcards.
Date dans les indexes
« Date math index name resolution » permet de chercher dans un intervalle de temps choisi. La syntaxe est : <static_name{date_math_expr{date_format|time_zone}}>.
Dans la requête url, les symboles utilisés dans la date doivent être codés : 
<	%3C
>	%3E
/	%2F
{	%7B
}	%7D
|	%7C
+	%2B
:	%3A
,	%2C

**Exemple de recherche :**
```
# GET /<logstash-{now/d}>/_search
GET /%3Clogstash-%7Bnow%2Fd%7D%3E/_search   
{    "query" : {
    "match": {      "test": "data"    }  }}
```

**Options communes**
Pretty results : en ajoutant ?pretty=true à la requête, le JSON retourné sera bien formaté, à utiliser pour le débogage seulement.
Human readable output : les statistiques sont retournées dans un langage compréhensible par les humains et ordinateurs. Pour l’enlever : ?human=false.
Date Math
Response Filtering : pour réduire les réponses obtenues avec le paramètre filter_path. 
Fuzziness : lorsqu’on requête un texte ou keyword, la fuziness est le nombre de changement de caractère à faire pour que la chaîne de caractère corresponde à une autre.
Inclure les stack traces : lorsqu’une requête envoie une erreur, pour pouvoir voir la stack trace : paramétrer error_trace=true

## Document APIs
**Lire et écrire des documents**
Chaque index dans elasticsearch est divisé en shard, et chaque shard peut avoir plusieurs copies. Il est important que les shards restent synchronisés : c’est le data replication model.
Une copie se comporte comme un shard primaire, les autres copies sont des réplications. La primaire est le point d’entrée des opérations, elle répliquera les données si elles sont validées.

**Index API**
Lorsqu’on ajoute un document, le header \_shards donne des informations sur l’opération d’indéxation, comme le nombre de copies shard (total), le nombre de succès et d’échec.
On peut paramétrer le temps d’attente, timeout, ainsi que les versions.

**Get API**
La get API permet de récupérer un JSON à partir de l’index, basé sur son ID.
Elle est en temps réel, et n’est pas affectée par l’actualisation de l’index. Si un document a été modifié mais pas actualisé, l’API appellera un refresh pour rendre le document visible.

**Delete API**
La delete api permet de supprimer des JSON à partir de son ID.
Il est possible de voir la version que l’on a supprimé d’un document, peu après sa suppression pour s’assurer que l’on a supprimé la bonne version. Par défaut ce temps est de 60 sec mais peut être modifié avec index.gc_deletes.

**Delete by query API**
```
POST twitter/_delete_by_query 
{   "query": {
      "match": {       "message": "some message"     }   } }
```
Il est possible de supprimer des documents de différents index et différents types en même temps : ```POST twitter,blog/_docs,post/_delete_by_query {  "query": {    "match_all": {}  }}```
Il est possible d’annuler une delete by query en utilisant la Task Cancel API : 
```POST _tasks/r1A2WoRbTwKZ516z6NEs5A:36619/_cancel```
La task ID peut être trouvé en utilisant las tasks API

Pour paralléliser les process de suppression, il est possible de découper la requête (sliced scroll). Cela peut être fait manuellement ou automatiquement.

**Update API**
L’Update API permet de modifier un document à partir d’un script.
```
POST test/_doc/1/_update 
{ "script" : {
        "source": "ctx._source.tags.add(params.tag)",
        "lang": "painless",
        "params" : { "tag" : "blue" }    }}
```
On peut par exemple, ajouter un tag (ctx.\_source.tags.add(), ctx.\_source.tags.contains(), ctx.\_source.tags.remove(), ctx.\_source.newchamp() ) 
On peut aussi utiliser un document partiel : 
```
POST test/_doc/1/_update 
{    "doc" : {   "name" : "new_name"    }}
```
Les mises à jour qui ne changent rien au document donneront un resultat :”noop”.

Si le document n’existe pas encore, le contenu de « upsert » sera inséré comme un nouveau document, sinon la partie script sera exécutée.
```
POST test/_doc/1/_update
{    "script" : {
        "source": "ctx._source.counter += params.count",
        "lang": "painless",
        "params" : {   "count" : 4   }    },
      "upsert" : {  "counter" : 1    }}
```
**Update by query API**
```
POST twitter/_update_by_query   
{  "script": {
    	"source": "ctx._source.likes++",
"lang": "painless"  },
   "query": {    "term": {      "user": "kimchy"    }  }}
```
Une mise à jour peut être annulée, comme pour les suppressions.

**Multi Get API**
Multi get API permet d’avoir plusieurs documents à partir d’un index et d’un ID, regroupés dans un tableau « docs ».
```
GET /_mget   
{    "docs" : [     {  "_index" : "test",        "_type" : "_doc",            "_id" : "1"   },    {            "_index" : "test",            "_type" : "_doc",            "_id" : "2"        }    ]}
```
**Reindex API**
La forme la plus basique de \_reindex copie les documents d’un index vers un autre.
```
POST _reindex 
{  "source": {
    	"index": ["twitter", "blog"],
   	"type": ["_doc", "post"]  },   
    	"dest": {    "index": "all_together",    "type": "_doc"  }}
```
**Term Vectors**
Renvoie des informations et statistiques sur les termes de champs d’un document particulier, en temps réel (et non NRT).
Exemple : GET /twitter/\_doc/1/\_termvectors
Pour spécifier le champ à regarder : GET /twitter/\_doc/1/\_termvectors?champs=message
3 types de valeurs peuvent être requêter : « term information » (fréquence du terme dans le champ, positions du terme, début et fin du terme, term playloads), « term statistics » (fréquence totale du terme, fréquence de document) et « champ statistics » (combien de document contient le champ, somme des fréquences de document pour chaque terme dans un champ, somme des fréquences de termes pour chaque terme dans le champ). Il est possible de filtrer les termes à regarder, avec par exemple : max_num_terms, min_term_freq, max_word_length…).

## Search APIs
Lorsqu’on exécute une recherche, cela est transmis à tous les index/indices de shards. Le choix du shard à rechercher peut être controllé en donnant un paramètre de routing. Par exemple, quand on indexe un document, une valeur de routing peut être l’user name : 
```
POST /twitter/_doc?routing=kimchy  
{    "user" : "kimchy",    "postDate" : "2009-11-15T14:12:12",    "message" : "trying out Elasticsearch"}
```
Ensuite, si on veut chercher les documents pour un user spécifique, on peut le spécifier dans le routing, en oubliant pas de filtrer également l’user : 
```
POST /twitter/_search?routing=kimchy  
{    "query": {
        "bool" : {
            "must" : {
                "query_string" : { "query" : "some query string here" }            },
"filter" : {  "term" : { "user" : "kimchy" }   }        }    }}
```
**URI Search**
Une recherche peut être faite en utilisant directement un URL fournissant des paramètres de requêtes. Cela peut être pratique pour faire de simples requêtes. Différents paramètres sont autorisés dans l’URI, comme : « q » pour faire une requête ; « df » pour donner le champ par défaut à utiliser, _source, sort, timeout …

**Request Body Search**
Une requête peut être faite avec une recherche DSL.
L’élement « query » permet de définir une requête en utilisant le Query DSL.
La pagination des résultats peut être faite en utilisant les paramètres « from » et « size ».
Il est possible de trier les différents champs avec « sort » (avec un ordre asc ou desc, ou pour des arrays ou multi-valued champs, avec un mode min, max, sum, avg ou median). Le paramètre « missing » permet de spécifier comment traiter les documents pour lesquels le champ de tri est absent : -last ou -first.
On peut filtrer les champs de \_source, par exemple avec "\_source": {   "includes": ["obj1.\*","obj2.\*" ],     "excludes": [\ "\*.description" ] }.
Pour filtrer après une aggrégation, on utilisera « post\_filter ».

**Rescoring** : peut améliorer la précision en réorganisant les top (100 à 500) documents rendus par une requête ou post_filter, avec la requête « rescore ».
Pour récupérer davantage qu’une seule « page » de résultat, on peut réupérer davantage de résultats, voire plus, avec une seule recherche en utilisant l’API « scroll ».
Il est possible de voir les objets imbriqués ou documents enfants/parents qui ont permis à certaines informations à être renvoyées, avec « inner_its » : "<query>" : {     "inner_hits" : {        <inner_hits_options>    }}
Pour réduire (collapse ?) la taille des résultats, par rapport à la valeur d’un champ, on utilise « collapse ».
Pour gérer la pagination, il existe également « search_after ».

**Search template**

L’endpoint /\_search/template permet d’utiliser le langage mustache pour pré-afficher les demandes de recherche, avant leur exécution et remplir les modèles existants avec des paramètres de modèle.
Par exemple : 
GET \_search/template
{    "source" : {
      	"query": { "match" : {   "{{my_champ}}" : "{{my_value}}"    } },
     	 "size" : "{{my_size}}"    },
      "params" : {  "my_champ" : "message",  "my_value" : "some message",  "my_size" : 5    }}

**Suggesters**
Permet de suggérer des termes similaires dans un texte fourni.
**Count API**
Le count API permet d’exécuter une requête et compter le nombre de correspondances pour cette requête. 
**Validate API**
Permet aux utilisateurs de valider une requête potentiellement coûteuse sans l’exécuter. 
**Explain API :**
Permet d’avoir des explications sur une requête pour un document spécifique. Ce peut être un feedback utile pour savoir pourquoi un document correspond ou pas à une requête.

##Agrégations
L’agrégation permet de regrouper des données selon une requête. Il existe différent types d’agrégations, qui peuvent être imbriquées.
Structure des agrégations :
```
"aggregations" : {
    "<aggregation_name>" : {
        "<aggregation_type>" : {
            <aggregation_body>
        }
        [,"meta" : {  [<meta_data_body>] } ]?
        [,"aggregations" : { [<sub_aggregation>]+ } ]?
    }
    [,"<aggregation_name_2>" : { ... } ]*
}
```
Certaines agrégations travaillent sur des valeurs extraites des documents agrégés, depuis un champ renseigné lors de l’agrégation. Il est aussi possible de définir un script pour générer les valeurs. Quand les paramètres champ et script sont tous les deux configurés, le script sera traité comme un value script : alors qu’un script est évalué au niveau du document, une value script sera évalué au niveau des valeurs : le script va appliquer une transformation aux valeurs extraites des champ configurés.

**Metric aggregations**
Des agrégations qui gardent une trace et calculent des métriques sur un ensemble de documents.
Ex : avg, weighted avg, cardinality, extended stats, geo bounds, max, min, percentiles, stats, sum, value count, top hits, median…
Bucket aggregations
Une famille d’agrégations qui construit des compartiments, où chaque compartiment est associé à une clé et un critère de document.
Ex : Adjacency Matrix, Date Histogram, Intervals, Children, Composite, Diversified, Filters, Geo Distance, Global, IP Range Aggregation, Missing, Nested, Parent, Range, Terms
Pipeline aggregations
Agrégation qui agrège la sortie d’autres agrégations et leur métrique associée. La plupart des agrégations pipeline requièrent une autre agrégation dans leur input, défini dans le paramètre bucket_path.
Par exemple : 
```
POST /_search 
{    "aggs": {
        "my_date_histo":{
     	"date_histogram":{ "champ":"timestamp",    "interval":"day"     },
           "aggs":{
    "the_sum":{"sum":{ "champ": "lemmings" }   },
    "the_movavg":{"moving_avg":{ "buckets_path": "the_sum" }       }      }        }    }}
Différents types : avg bucket, derivative, max, min, sum…
```
**Matrix aggregations**
Famille d’agrégation qui opère sur de multiples champs et produit un résultat matriciel, basé sur les valeurs extraites des champs des documents requêtés.
Matrix stats permet de faire une agrégation numérique sur une série de champs de documents.

Ne rendre que le résultat d’une agrégation : paramétrer « size=0 ».

Il est possible d’associer des métadonnées à une agrégation individuelle.

## Indices APIs
**Indice Exists**
Utiliser le verbe HEAD, par exemple : HEAD twitter

Open / Close Index API
Permet de fermer un index et de le rouvrir plus tard. Un index fermé n’a pratiquement plus de « overhead » dans le cluster et est bloqué pour des opérations de lecture et écriture.
``` 
POST "localhost:9200/my_index/_close"
POST "localhost:9200/my_index/_open" 
```

**Shrink Index**
Permet de réduire un index existant en un nouvel index avec moins de shards primaires.

**Split Index**
Permet de séparer un index existant en un nouvel index où le shard primaire originel est séparé en 2 ou davantage de shards primaires.

**Put Mapping**
L'API de mappage PUT vous permet d'ajouter des champs à un index existant ou de modifier les paramètres de recherche uniquement des champs existants.
```
PUT twitter/_mapping/_doc 
{ "properties": {  "email": {   "type": "keyword"  }  }}
```
**Get Mapping**
Permet de récupérer la définition du mappage pour un index ou index/type.
Pour récupérer le mappage des fields : par exemple GET publications/_mapping/_doc/field/title


**Index Templates**
Index templates permet de définir des modèles qui seront automatiquement appliqués quand de nouveaux indices sont créés. Ils incluent les paramètres et mappage.
Exemple :
```
PUT _template/template_1 
{  "index_patterns": ["te*", "bar*"], 
   "settings": { "number_of_shards": 1 }, 
   "mappings": {
  "_doc": {
  		"_source": {  "enabled": false  },
      		"properties": {    
 		"host_name": {   "type": "keyword"   },
   		"created_at": {   "type": "date", "format": "EEE MMM dd HH:mm:ss Z yyyy"   }   }  }  }}

```
## Cat APIs
Même s’il est joliment imprimé, il peut être difficile d’essayer de trouver des relations dans les données. L’API permet d’avoir dans le terminal un texte compact et aligné. 


## Query DSL
Query DSL peut être pensé comme un AST (Abstract Syntax Tree) de requêtes, avec de types de clauses :
-	Leaf query clauses : regarde une valeur particulière dans un champ particulier, comme les requêtes match, term ou range.
-	Compound query clauses : englobe d’autres leaf ou compound requêtes et son utilisées pour combiner plusieurs requêtes dans une logique (bool, dis_max) ou pour modifier leurs comportements (constant_score)
Les clauses de requêtes agissent différemment selon si elles sont utilisées dans un contexte de requête ou de filtre.


**Query and filter context**
Une clause de requête dans un contexte de requête répond à la question : « à quel point ce document correspond à cette clause de requête ?». Une clause de requête dans un contexte de filtre répond à la question « est-ce que ce document correspond à la clause de requête ? », aucun score n’est calculé. Cela sert plutôt à filtrer des données structurées.

**Full text queries**
Match, match_phrase, match_phrase_prefix, multi_match, common terms, query_string, simple_query_string

**Term level queries**
Term, terms, terms_set, range, exists, prefix, wildcard, regexp, fuzzy, type, ids

**Compound queries**
Constant_score, bool, dis_max, function_score, boosting.
Joining queries
Les requêtes de jointure de type SQL sont très coûteuses, elasticsearch offre deux formes de jointures, conçues à une échelle horizontale.
-	Nested : les champs nested sont utilisés pour indexer des tableaux d’objets, où chaque objet peut être requêté (nested) comme un document indépendant
-	Has_child ou has_parent : une relation de jointure de champ peut exister entre des documents au sein d’un seul index. La requête has_child renvoie les documents parents dont les documents enfants correspondent à une certaine requête, et inversement pour has_parent.

**Requêtes spéciales**
more_like_this, script, percolate, wrapper.

**Mapping**
Le mappage est le processus permettant de définir comment un document et les champs qu’il contient sont stockés et indexés. 

## Exemples DZone : https://dzone.com/articles/23-useful-elasticsearch-example-queries 
*Boosting : pour booster le score de certains champs.
Bool Query : opérateurs AND (must), OR (should), NOT
Fuzzy Queries : pour éviter les erreurs d’écriture
Wildcard Query : pour spécifier un modèle au lieu d’un terme
RegExp Query
Match Phrase Query : pour que tous les termes d’une chaîne soient dans le document
Match Phrase Prefix
Query String : une syntaxe plus courte pour presque tout chercher
Range Query

And more …*




