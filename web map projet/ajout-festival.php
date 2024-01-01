<?php
session_start();

function getAddressCoordinates($address) {
    $apiKey = 'AIzaSyB9qz5KaB2XxmUfmilsdtvBAI2V0tEft9U';
    $url = "https://maps.googleapis.com/maps/api/geocode/json?address=" . urlencode($address) . "&key=" . $apiKey;
    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if ($data['status'] === 'OK' && isset($data['results'][0]['geometry']['location'])) {
        return $data['results'][0]['geometry']['location'];
    } else {
        return null;
    }
}

if (isset($_POST['login'])) {
    $conn = new PDO('mysql:host=localhost;dbname=connection;charset=utf8;', 'root', 'root');
    $id_createur = $_SESSION['id'];
    $adresse = $_POST['adresse'];
    $nom = $_POST['nom'];

    // Obtenir les coordonnées depuis l'adresse
    $coordinates = getAddressCoordinates($adresse);

    if ($coordinates) {
        $latitude = $coordinates['lat'];
        $longitude = $coordinates['lng'];

        // Insérer les données dans la base de données
        $insertUser = $conn->prepare('INSERT INTO festival(adresse, nom, id_createur, latitude, longitude) VALUES(?,?,?,?,?)');
        $insertUser->execute(array($adresse, $nom, $id_createur, $latitude, $longitude));

        header('location: espace_cli.php');
    } else {
        // Gérer le cas où les coordonnées ne peuvent pas être obtenues
        echo "Erreur lors de la récupération des coordonnées.";
    }
}
?>
<!DOCTYPE html>
<html lang="fr">

<head>

</head>

<body>
    <form method="post" action="" class="formulaire">
        <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">adresse du festival</label>
            <input type="text" name="adresse" class="form-control" id="exampleFormControlInput1" placeholder="Entrez votre pseudo" required autocomplete="off">
        </div>
        <div class="mb-3">
            <label for="exampleFormControlInput1" class="form-label">nom du festival</label>
            <input type="text" name="nom" class="form-control" id="exampleFormControlInput1" placeholder="Entrez le nom du festival" required autocomplete="off">
        </div>
        <button type="submit" class="btn btn-primary" name="login" style="margin-top: 20px">Envoyer</button>
    </form>
</body>

</html>
