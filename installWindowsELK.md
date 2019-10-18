1.	Introduction


This document is a tutorial for the installation and the use of ELK – elasticsearch, logstash and kibana-. These tools are used in order to work on logfiles : save, show or analyse different logs. 
In this document, you will find how to install and use ELK on a WINDOWS machine.
It is based on my own experience but this document can be destined to people who wants to use the tools on their own logs.
2.	Installation
2.1.	Java 8
You need to have Oracle Java 8 or later version.
Make sure to set JAVA_HOME in the environmental variables.
2.2.	Elasticsearch
Download the .zip archive and unzip in the directory c:\elasticsearch-6.5.4.
cd c:\Program Files\elasticsearch
.\bin\elasticsearch.bat
To configure Elasticsearch : Any settings that can be specified in the config file can also be specified on the command line, using the -E syntax as follows:
.\bin\elasticsearch.bat -Ecluster.name=my_cluster -Enode.name=node_1
To see how to configure : https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html 

For our use, we had to install elasticsearch as a service : 
cd c:\Program Files\elasticsearch\bin
elasticsearch-service.bat install
Then in the Window Service Manager, run the elasticearch service created.

Some errors have appeared: 
1. Java Path was not well configured. I had to restart.
2. When I have tried to install elasticsearch as a service, I had an error “elasticsearch is not a Win32 service”. It means that I have a 64 bits service, and Windows is trying to install it as a 32 bits service.
When I installed elasticsearch, he needed JAVA_HOME, but this environmental variable was pointed to the wrong Java JDK file. It pointed to the 32 bits version, instead of the 64 bits. I only had to download a 64 bit jdk and change JAVA_HOME.
2.3.	Logstash
Download the .zip archive and unzip.
Before running Logstash you need to create a configuration file, with at least one input and one output. (see the section “3.2. Configure Logstash”)
When it’s done, to run logstash :
Cd c:\logstash\bin
logstash.bat -f c:\logstash\bin\logstash.conf
to stop logstash : press CTRL + C

Errors: 
1.	Could not find or load main class Files\logstash\logstash-core\lib\jars\animal-sniffer-annotations-1.14.jar;C:Program
Had to change the directory of logstash file, to have a directory without any space
2.	Failed to execute action {:action=>LogStash::PipelineAction::Create/pipeline_id:main, :exception=>"LogStash::ConfigurationError", :message=>"Expected one of #, input, filter, output at line 13, column 5 (byte 150) after ", :backtrace=>["d:/Profiles/atordjmann/logstash-6.5.4/logstash-core/lib/logstash/compiler.rb:41:in `compile_imperative'"
Had to modify my configuration file.


2.4.	Kibana
Download the .zip archive and unzip.
Kibana can be started from the command line as follows:
.\bin\kibana.bat
By default, Kibana runs in the foreground, prints its logs to STDOUT, and can be stopped by pressing Ctrl-C.
Kibana loads its configuration from the $KIBANA_HOME/config/kibana.yml file by default

You can go on localhost:5601 and see that everything is working well.

Problem : kibana and logstash are not services. So when I start kibana, I cannot start logstash at the same time. 
	You need to open 2 command prompt

3.	Use

3.1.	Start
Elasticsearch
cd c:\Program Files\elasticsearch\bin\elasticsearch.bat
As you have installed Elasticsearch as a service, you don’t need to start with the command line, you have to go in your “Services” and start Elasticsearch service.
Logstash
cd c:\logstash\bin\logstash.bat –f c:\logstash\config\logstash_conf.conf
It is important to specify the configuration file!
Kibana
cd c:\kibana\bin\kibana.bat
3.2.	Configure Logstash
Logstash configuration files are in the JSON-format, and reside in /etc/logstash/conf.d. The configuration consists of three sections: inputs, filters, and outputs.

In the next paragraph, you will find an example of configuration and further information.

When you modify your configuration file, you need to restart to enable Logstash to put our configuration changes into effect. The changes won’t be applied to logs that were already sent to elasticsearch.

3.3.	Logs Treatment: configuring Logstash and Grok

Example of a configuration file for logstash:

input {
  file{
		type => "UST-CD13-log"
		path => "d:\Profiles\atordjmann\Documents\ELK\logs\UST.1.log"     
	}
}

filter {
 if [type] == "UST-CD13-log" {
     grok {
	   #DATA : text without spaces
	   #NUMBER : integer
	   #GREEDYDATA : all text with spaces
       match => { "message" => "%{DATA:timestamp1};%{NUMBER:field3:int};%{GREEDYDATA:rest}" }
    }

    date {
		#By default : target to @timestamp
        match => [ "timestamp1" , "yyyy-MM-dd HH:mm:ss,SSS" ]
     }
  }

  if "_grokparsefailure" in [tags] {
    drop {}
  }
}
   
output {
	elasticsearch {
		hosts => ["localhost:9200"]
	}
	stdout {
	codec => "rubydebug"
	}
} 

Grok filters for logstash are used to extract information from messages. They are based on regular expression. It exists a lot of already defined patterns, as shown in the following extract of grok patterns : 
USERNAME		USER		INT		NUMBER	WORD		NOTSPACE	
SPACE			DATA		GREEDYDATA	QUOTEDSTRING		IP	
HOSTNAME		HOST		HOSTPORT	PATH		URIPROTO	URIHOST	
URIPATH		URIPARAM	MONTH		DAY		YEAR		HOUR	
MINUTE		SECOND	TIME		DATESTAMP	SYSLOGBASE
COMMONAPACHE LOG			COMBINEAPACHELOG		LOGLEVEL
	
	The structure of a grok is :
Grok{
	Match => { “message” => “%{PATTERN1:titre1} %{PATTERN2:titre2}” }
	}
For example to fit a message like “2018-09-12 16:38:36.5838 | Erreur Identifiant de correlation=APPLI\ADMIN-4356f5ff-4568dzzu-2124ef-7889, URL=http://app-appli/
You can use the grok pattern : %{DATESTAMP:timestamp}(\|*?)%{WORD:event}(Identifiant de correlation=.*?)%{DATA:user}(\-*?)%{DATA:guid}(, URL=.*?)%{URI:url}
Mostly, to have good grok, you need to know how to use Regex.
Kibana offers a grok debugger, and you can find many debugger on the internet. Also it is important to analyze the structure of your log before writing groks.

If you don’t find what you want in already existing patterns, you can create a new pattern. For example with the email address
In a file “/etc/logstash/mypatterns.conf”, you write your pattern :
MAIL \b[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b
In the grok, you specify : pattern => ‘%{MAIL : email_adress}’
When you open logstash, in order to take into account the pattern, you need to write the command line : 
	$java –jar /etc/logstash/logstash.jar agent –f /etc/logstash/logstash.conf –grok –patterns –path /etc/logstash/mypatterns.conf

It is really important to write “good” grok, that is to say, groks that fit best the logs. A grok should be “precise” : it should not fit groks that are too different but it must fit to some logs, in order to analyze every logs.
It is possible to have a very complex configuration file, possibilities are infinite. For example I had a file of several hundred of lines, where I had conditions on the type of application logs, different groks to fit different logs and aggregation.


3.4.	Further treatments and tips 
Warning ! If you change the grok, you may add some fields, and so, you need to refresh your index pattern.
3.4.1.	Encoding
If you work with logs in French, you may face accents issues. Be sure you have the right encoding. If you don’t, add the line : codec => plain { charset => "ISO-8859-1" } in the input, in “file”.
3.4.2.	Multiline logs
Especially when you have a stacktrace, your logs may be multiline. If you don’t specify anything, logstash will see the return to the line as a new log, even if it doesn’t have a timestamp.
To specify that a log begins with a timestamp you can write in the input, in “file”:
start_position => "beginning"
		codec => multiline {
			pattern => "^%{TIMESTAMP_ISO8601}"
			negate => true
			what => "previous"
			charset => "ISO-8859-1"
		}	
If you change the encoding, put the charset in codec => multiline, instead of codec => plain.

If you have different files, you need to write it for each file.	
3.4.3.	Same file but different logs
With an if condition, you can have different groks, for example : 
if ("SUCCESS" not in [tags]){
			grok { match => { "message" => "%{DATESTAMP:timestamp} …"}
				add_tag => ["SUCCESS"]
				remove_tag => ["_grokparsefailure"] 	}
		}
	
	if ("SUCCESS" not in [tags]){
			grok { 	match => { "message" => %{DATESTAMP:timestamp}…"}
				add_tag => ["SUCCESS"]
				remove_tag => ["_grokparsefailure"] 	}
		}
		
3.4.4.	Aggregation
Aggregation can be really usefull with logs. For example when you have an error, different exceptions are raised, and it can be really interesting to link them in logstash. This is were “aggregate” step in. It offers the possibility to group by an “id” different logs. You will find explanation and example on : https://www.elastic.co/guide/en/logstash/current/plugins-filters-aggregate.html#plugins-filters-aggregate-code
But to use it, your error and exceptions must have something in common like a timestamp or an ID, that you will specified in the “task-id” parameter of aggregate.
In the “code” parameter, you have to mention what you want to do with your aggregation. For exemple; I have chosen to show the messages and information (user, url, event…) of my exceptions, using the grok. You may use other parameters like “timeout”, if your logs are not always sent one after an other.
aggregate{	task_id => "%{timestamp}"
			code => "map['exception'] ||= 0 
				map['exception'] += 1
				map['event'] ||= []
				map['event'] += [event.get('event')]
				map['stacktrace'] ||= []
				map['stacktrace'] += [event.get('stacktrace')]
				map['eventmessage'] ||= []
				map['eventmessage'] += [event.get('eventmessage')]
				map['user'] ||= []
				map['user'] += [event.get('user')]
				map['url'] ||= []
				map['url'] += [event.get('url')]
				map['message'] ||= []
				map['message'] += [event.get('message')]
				map['type'] = event.get('type')
			push_map_as_event_on_timeout => true
			timeout_task_id_field => "timestamp"
			timeout => 10
			timeout_tags => ['aggregatetimeout']
			timeout_code => "event.set('several_exceptions', event.get('exception')>1)" }
Aggregate will group logs, but as a new hit. So if you grok a log, and you aggregate, you will find your log twice in kibana. To avoid that, I used an if condition :
if ("SUCCESS" in [tags]) {
			drop {}
		}
3.5.	Build a visualization
First you need to add an index pattern : Management > Kibana > Index Patterns > Create index pattern


Then you can see your data in the  “Discover” menu.

To add a visualization : Go to visualize menu, click the blue cross, choose your visualization type, select the corresponding data, save the visualization.
Then add it to a dashboard. Create a new dashboard, add Panels by searching the visualizations you have saved.


When you want to modify a dashboard, click “Edit”. 

4.	Resources

https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-logstash-and-kibana-elk-stack-on-centos-7
https://www.supinfo.com/articles/single/827-elk-linux-installation
https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html
https://www.elastic.co/guide/en/logstash/current/installing-logstash.html
https://www.elastic.co/guide/en/kibana/current/setup.html

