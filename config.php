<?php

define('DB_NAME','rayan_db');
define('DB_USER','root');
define('DB_PASSWORD','');
define('DB_HOST','localhost');

$mysqli = new mysqli(DB_NAME, DB_USER, DB_PASSWORD, DB_HOST); //DB NAME

date_default_timezone_set('Asia/Jakarta');