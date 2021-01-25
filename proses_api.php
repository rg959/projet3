<?php

header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Origin, Content-Type, Authorization, Accept, X-Request-With, x-xsrf-token");
header("Content-Type: application/json; charset=utf-8");

include "config.php";

$postjson = json_decode(file_get_contents('php://input'), true);
$today = date('Y-m-d H:i:s');

if($postjson[aksi]=="proses_register"){

    $cekemail = mysqli_fetch_array(msqli_query($mysqli, "SELECT email_address FROM tb_users WHERE email_address='$postjson[email_address]'"));

        if ($cekemail['email_address']==$postjson['email_address']) {
            $result = json_encode(array('success'=>false, 'msg'=>'Email is already taken'));
        }else{

        $password = md5($postjson['password']); //protéger le mot de passe
        $insert = mysqli_query($mysqli, "INSERT INTO tb_users SET
            your_name = '$postjson[your_name]',
            gender = '$postjson[gender]',
            date_birth = '$postjson[date_birth]',
            email_address = '$postjson[email_address]',
            password = '$password',
            created_at = '$today'
        ");

        if($insert){
            $result = json_encode(array('success'=>true, 'msg'=>'Register successfully'));
        }else{
            $result = json_encode(array('success'=>false, 'msg'=>'Register error'));
        }
    }

    echo $result;
}
elseif($postjson[aksi]=="proses_login"){

    $password = md5($postjson['password']);
    $logindata = mysqli_fetch_array(msqli_query($mysqli, "SELECT * FROM tb_users WHERE email_address='$postjson[email_address]' AND
            password='$password'"));

        $data = array(
            'id_user' => $logindata['id_user'],
            'your_name' => $logindata['your_name'],
            'gender' => $logindata['gender'],
            'date_birth' => $logindata['date_birth'],
            'email_address' => $logindata['email_address'],
        );

        if($logindata){
            $result = json_encode(array('success'=>true, 'result'=>$data));
        }else{
            $result = json_encode(array('success'=>false));
        }
    }
