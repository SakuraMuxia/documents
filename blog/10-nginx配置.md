# Nginx配置

## nginx配置

```shell

#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}

stream {
	upstream nacoscluster {
		server 172.16.0.33:8848;
		server 172.16.0.34:8848;
		server 172.16.0.35:8848;
	}
	server {
		listen 8849;
		proxy_pass nacoscluster;
	}

	server {
		listen 9300;
		proxy_pass 172.16.0.34:8080;
	}
            server {
		listen 3309;
		proxy_pass 172.16.0.35:3308;
	}
	upstream tdenginecluster {
		server 172.16.0.33:6030;
		server 172.16.0.34:6030;
		server 172.16.0.35:6030;
	}


	server {
		listen 6029;
		proxy_pass tdenginecluster;
	}

	upstream xxl-job-admin {
	    	server 172.16.0.34:8081;
    		server 172.16.0.35:8081;
	}

	server {

		listen 8085;
		proxy_pass xxl-job-admin;
	}
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    server {
        listen       80;
        server_name  localhost;

        location = / {
            root   html;
	        rewrite ^/$ /website permanent;
        }
	

	location /logs/info {
            root    /essd/project/switch/;
            autoindex on;
	        autoindex_localtime on;        
	}

	location /cmc/info {
            root    /opt/temper/logs/;
            autoindex on;
	        autoindex_localtime on;        
	}


	location /intell/switch {
	        alias   /essd/project/switch/dist;
	        index  index.html index.htm;
        }

	location /tower/switch {
	        alias   /essd/project/switch/towerdist;
	        index  index.html index.htm;
        }

	location /temper/condition {
	        alias   /opt/temper/dist;
	        index  index.html index.htm;
        }

	location /tower/temper {
	        alias   /opt/temper/towerdist;
	        index  index.html index.htm;
        }

	location /show/temper {
	        alias   /opt/temper/showdist;
	        index  index.html index.htm;
        }

	location /cooling {
		root /usr/local/nginx/html;
		index index.html index.htm;
		try_files $uri $uri/ /cooling/index.html;
	}
	location /static/ {
		alias /usr/local/nginx/html/cooling/static/;
		expires 1h;
		add_header Cache-Control "public,max-age=3600";
	}
	location /charging {
		root /usr/local/nginx/html;
		index index.html index.htm;
		try_files $uri $uri/ /charging/index.html;
	
	}
	
	location /prod-api/ {
		proxy_pass http://localhost:8400/;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		rewrite ^/prod-api/(.*)$ /$1 break;
	
	}

	location /switch {
		root /usr/local/nginx/html;
		index index.html index.htm;
		try_files $uri $uri/ /switch/index.html;
	}
        #error_page  404              /404.html;

        # redirect server error pages to the static page /50x.html
        #
        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   html;
        }

        # proxy the PHP scripts to Apache listening on 127.0.0.1:80
        #
        #location ~ \.php$ {
        #    proxy_pass   http://127.0.0.1;
        #}

        # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
        #
        #location ~ \.php$ {
        #    root           html;
        #    fastcgi_pass   127.0.0.1:9000;
        #    fastcgi_index  index.php;
        #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
        #    include        fastcgi_params;
        #}

        # deny access to .htaccess files, if Apache's document root
        # concurs with nginx's one
        #
        #location ~ /\.ht {
        #    deny  all;
        #}
	access_log off;
    }

    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       8000;
    #    listen       somename:8080;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       443 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

}

```

