1.	Introduction


This document is a tutorial for the installation and the use of ELK – elasticsearch, logstash and kibana-. These tools are used in order to work on logfiles : save, show or analyse different logs. This step is a part of a project of digitalisation : logs are information treated by human, it is expensive and takes time. With this tool we can reduce costs and make easier the treatment of logfiles.

In this document, you will find how to install and use ELK on a LINUX virtual machine (CentOS 7).
2.	Installation
2.1.	Java 8
You need to have Oracle Java 8. If you don’t : 
cd ~
wget --no-cookies --no-check-certificate --header "Cookie: gpw_e24=http%3A%2F%2Fwww.oracle.com%2F; oraclelicense=accept-securebackup-cookie" http://download.oracle.com/otn-pub/java/jdk/8u73-b02/jdk-8u73-linux-x64.rpm
sudo yum -y localinstall jdk-8u73-linux-x64.rpm

2.2.	Elasticsearch

sudo rpm --import http://packages.elastic.co/GPG-KEY-elasticsearch
nano /etc/yum.repos.d/elasticsearch.repo

In the file ‘elasticsearch.repo’, paste the following lines :
[elasticsearch-6.x]
name=Elasticsearch repository for 6.x packages
baseurl=https://artifacts.elastic.co/packages/6.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md

sudo yum install elasticsearch

To edit the configuration :  
sudo nano /etc/elasticsearch/elasticsearch.yml
and specify the ‘network.host’

2.3.	Logstash
sudo nano /etc/yum.repos.d/logstash.repo

Paste the following lines :
[logstash-6.x]
name=Elastic repository for 6.x packages
baseurl=https://artifacts.elastic.co/packages/6.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md

sudo yum install logstash
2.4.	Kibana
sudo nano /etc/yum.repos.d/kibana.repo

Paste the following lines : 
[kibana-6.x]
name=Kibana repository for 6.x packages
baseurl=https://artifacts.elastic.co/packages/6.x/yum
gpgcheck=1
gpgkey=https://artifacts.elastic.co/GPG-KEY-elasticsearch
enabled=1
autorefresh=1
type=rpm-md

sudo yum -y install kibana

Configure Kibana, specify the ‘server.host’:
sudo vi /opt/kibana/config/kibana.yml
2.5.	Nginx

Add the EPEL repository to yum:
sudo yum -y install epel-release

Use yum to install Nginx and httpd-tools:
sudo yum -y install nginx httpd-tools

Use htpasswd to create an admin user, called "kibanaadmin" (you should use another name), that can access the Kibana web interface:
sudo htpasswd -c /etc/nginx/htpasswd.users kibanaadmin
Enter a password at the prompt. Remember this login, as you will need it to access the Kibana web interface.

Now open the Nginx configuration file.
sudo nano /etc/nginx/nginx.conf
Find the default server block (starts with server {), the last configuration block in the file, and delete it. When you are done, the last two lines in the file should look like this:

nginx.conf excerpt
    include /etc/nginx/conf.d/*.conf;
}

Now create an Nginx server block in a new file:
sudo vi /etc/nginx/conf.d/kibana.conf

Paste the following code block into the file. Be sure to update the server_name to match your server's name:

server {
    listen 80;

    server_name example.com;

    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/htpasswd.users;

    location / {
        proxy_pass http://localhost:5601;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;        
    }
}
3.	Use
3.1.	Start services
To start elasticsearch, logstash, kibana and Nginx, you need to write and adapt the following lines for each service: 
sudo systemctl start the_service_you_want_to_start
sudo systemctl enable the_service_you_want_to_start


3.2.	Configure Logstash
Logstash configuration files are in the JSON-format, and reside in /etc/logstash/conf.d. The configuration consists of three sections: inputs, filters, and outputs.

In the next paragraph, you will find an example of configuration and further information.

Restart and enable Logstash to put our configuration changes into effect:

sudo systemctl restart logstash
sudo chkconfig logstash on

To use the configuration file when you start logstash : 

/usr/share/logstash/bin/logstash “—path.settings” “/etc/logstash” –f /etc/logstash/conf.d/logstash-configurationfile.conf


3.3.	Logs Treatment: configuring Logstash and Grok

Example of a configuration file for logstash:

input {
  file{
		type => "UST-CD13-log"
		path => "/data/logs/UST.1.log"     
	}
}

filter {
	if [type] == "UST-CD13-log" {
        grok {
        match => [ "message" => "%{YEAR}-%{MONTH}-%{MONTHDAY} %{TIME} %{LOGLEVEL} \[%{GREEDYDATA:thread}\] %{JAVACLASS:class} %{GREEDYDATA:details}"}        
	}
    }
      
    
    else {
        drop {}
    }
}
   
output {
	elasticsearch {
		hosts => ["slnxcnmsspic01.ptx.fr.sopra:9200"]
	}
	stdout {}
}

Grok :
Grok filters for logstash are used to extract information from messages. They are based on regular expression.
To create a new pattern : 
Example : email address
“/etc/logstash/mypatterns.conf” => MAIL \b[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b
In the grok : pattern => ‘%{MAIL : email_adress}’
To take into account the pattern : 
	$java –jar /etc/logstash/logstash.jar agent –f /etc/logstash/logstash.conf –grok –patterns –path /etc/logstash/mypatterns.conf


4.	Resources

https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-logstash-and-kibana-elk-stack-on-centos-7

https://www.supinfo.com/articles/single/827-elk-linux-installation
https://www.elastic.co/guide/en/elasticsearch/reference/current/deb.html
https://www.elastic.co/guide/en/logstash/current/installing-logstash.html
https://www.elastic.co/guide/en/kibana/current/setup.html

5.	Useful command lines
netstat –plntu
systemctl status –l logstash.service
curl slnxcmsspic01.ptx.fr.sopra:9200/_cat/indices?v
