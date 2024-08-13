<?php
require 'conexionbd.php';

if(!isset($_SESSION['usuario'])){
    // echo "HTTP 403 Forbidden";
    // exit;
}

function consultaGeneral($query){
    try{
        $conn = conectarBDMN();
        $obtenerDatos = sqlsrv_query($conn, $query);
        if ($obtenerDatos == FALSE)
            die(print_r(sqlsrv_errors(),true));
            $cont = 0;
            $datos = [];
        while($row = sqlsrv_fetch_array($obtenerDatos, SQLSRV_FETCH_ASSOC)){
            $datos[$cont] = $row;
            $cont++;
        }
        sqlsrv_free_stmt($obtenerDatos);
        sqlsrv_close($conn);
        
        return json_encode($datos);
    }
    catch(Exception $e){
        echo("Error " . $e);
    }
}

function insertarGeneral($query){
    try{
        $conn = conectarBDMN();
        $insertReview = sqlsrv_query($conn, $query);
        if($insertReview == FALSE)
            die(print_r(sqlsrv_errors(),true));
        $cont = 0;
        $datos = [];
        while($row = sqlsrv_fetch_array($insertReview, SQLSRV_FETCH_ASSOC)){
            $datos[$cont] = $row;
            $cont++;
        }

        sqlsrv_free_stmt($insertReview);
        sqlsrv_close($conn);
        return json_encode($datos);
    }
    catch(Exception $e){
        echo("Error". $e);
    }
}


function eliminarGeneral($query){
    try{
        $resultado = false;
        $conn = conectarBDMN();
        $insertReview = sqlsrv_query($conn, $query);
        if($insertReview == FALSE)
            die(print_r(sqlsrv_errors(),true));
        else
            $resultado = true;

        sqlsrv_free_stmt($insertReview);
        sqlsrv_close($conn);
        return $resultado;
    }
    catch(Exception $e){
        echo("Error". $e);
    }
}

function mostrarMarcasInversores(){
    $datos = json_decode(consultaGeneral("SELECT ID_MARCA, DESC_MARCA FROM [MEDICION_NETA].[dbo].[MARCAS_INVERSORES] order by DESC_MARCA ASC"), true);
    foreach ($datos as $item) {
        echo "<option value='".$item["ID_MARCA"]."'>".$item["DESC_MARCA"]."</option>";
    }
}

function mostrarModelosInversores($ID_MARCA){
    $datos = json_decode(consultaGeneral("SELECT ID_MODELO, DESC_MODELO FROM [MEDICION_NETA].[dbo].[MODELOS_INVERSORES] WHERE ID_MARCA = $ID_MARCA order by DESC_MODELO ASC"), true);
    echo json_encode($datos);
}

function mostrarMarcasModulosFotovoltaicos(){
    $datos = json_decode(consultaGeneral("SELECT ID_MARCA, DESC_MARCA FROM [MEDICION_NETA].[dbo].[MARCAS_MODULOS_FOTOVOLTAICOS] order by DESC_MARCA ASC"), true);
    foreach ($datos as $item) {
        echo "<option value='".$item["ID_MARCA"]."'>".$item["DESC_MARCA"]."</option>";
    }
}

function mostrarModelosModulosFotovoltaicos($ID_MARCA){
    $datos = json_decode(consultaGeneral("SELECT ID_MODELO, DESC_MODELO FROM [MEDICION_NETA].[dbo].[MODELOS_MODULOS_FOTOVOLTAICOS] WHERE ID_MARCA = $ID_MARCA order by DESC_MODELO ASC"), true);
    echo json_encode($datos);
}

function mostrarEstadosCiviles(){
    $datos = json_decode(consultaGeneral("SELECT ID_ESTADO, DESC_ESTADO, M_FRECUENCIA FROM [MEDICION_NETA].[dbo].[ESTADOS_CIVILES] WHERE ESTADO = 1 order by ID_ESTADO ASC"), true);
    foreach ($datos as $item) {
        echo "<option ". ($item["M_FRECUENCIA"] == 1 ? "selected" : "") ." value='".$item["ID_ESTADO"]."'>".$item["DESC_ESTADO"]."</option>";
    }
}

function mostrarTarifas(){
    $datos = json_decode(consultaGeneral("SELECT TARIFA FROM [MEDICION_NETA].[dbo].[TARIFAS] WHERE ESTADO = 1 order by ID_TAR ASC"), true);
    foreach ($datos as $item) {
        echo "<option value='".$item["TARIFA"]."'>".$item["TARIFA"]."</option>";
    }
}

function mostrarConTransf(){
    $datos = json_decode(consultaGeneral("SELECT CON_TRANSFORMADOR FROM [MEDICION_NETA].[dbo].[CON_TRANSFORMADORES] WHERE ESTADO = 1 order by ID_CON_TRANSF ASC"), true);
    foreach ($datos as $item) {
        echo "<option value='".$item["CON_TRANSFORMADOR"]."'>".$item["CON_TRANSFORMADOR"]."</option>";
    }
}

function mostrarUbicacionesProyecto(){
    $datos = json_decode(consultaGeneral("SELECT ID_UBI_INST, DESC_UBI, M_FRECUENCIA FROM [MEDICION_NETA].[dbo].[UBICACION_INSTALACION] WHERE ESTADO = 1 order by ID_UBI_INST ASC"), true);
    foreach ($datos as $item) {
        echo "<option ". ($item["M_FRECUENCIA"] == 1 ? "selected" : "") ." value='".$item["ID_UBI_INST"]."'>".$item["DESC_UBI"]."</option>";
    }
}

function mostrarContratistas(){
    $datos = json_decode(consultaGeneral("SELECT ID_CTR, NOMBRE_CTR FROM [MEDICION_NETA].[dbo].[CONTRATISTAS] WHERE ESTADO = 1 order by NOMBRE_CTR ASC"), true);
    foreach ($datos as $item) {
        echo "<option value='".$item["ID_CTR"]."'>".$item["NOMBRE_CTR"]."</option>";
    }
}

function listarContratistas(){
    return json_encode(consultaGeneral("SELECT ID_CTR, NOMBRE_CTR FROM [MEDICION_NETA].[dbo].[CONTRATISTAS] WHERE ESTADO = 1 order by ID_CTR ASC"), true);
}

function listarSolicitudes(){
    return json_encode(consultaGeneral("SELECT * FROM listarSolicitudes ORDER BY FECHA_REGISTRO DESC"), true);
}

function historicoConsumos($NIC, $ANO){
    return json_encode(consultaGeneral("SELECT NIC, NIS, NOMBRE_CLT,TARIFA,
        KW_INV_INST,
        KWP_INST,
        CSMO_EDENORTE, 
        INYECCION_CLT, 
        CSMO_NETO, 
        ENERGIA_ACUMULADA, 
        CSMO_NETO_CON_ENERGIA_ACUMULADA, DESCUENTO_ENERGIA_ACUMULADA, 
        ANO, MES, ANO_MES, FORMAT(F_ULT_ACT, 'yyyy-MM-dd') AS F_ULT_ACT
        FROM CONTROL_GESTION_GC.dbo.ESTADISTICAS_MEDICION_NETA 
        WHERE NIC = '$NIC' AND ANO = '$ANO'
        ORDER BY ANO_MES ASC"), true);
}

function listarContratistasVista(){
    return json_encode(consultaGeneral("SELECT * FROM CONTRATISTAS ORDER BY NOMBRE_CTR ASC"), true);
}

function mostrarCargosRepresentantes(){
    $datos = json_decode(consultaGeneral("SELECT ID_CARGO_REPR, DESC_CARGO FROM [MEDICION_NETA].[dbo].[CARGOS_REPRESENTANTES] WHERE ESTADO = 1 order by DESC_CARGO ASC"), true);
    foreach ($datos as $item) {
        echo "<option value='".$item["ID_CARGO_REPR"]."'>".$item["DESC_CARGO"]."</option>";
    }
}

function mostrarSistemasGeneracion(){
    $datos = json_decode(consultaGeneral("SELECT ID_SISTEMA, SISTEMA, M_FRECUENCIA FROM [MEDICION_NETA].[dbo].[SISTEMAS_GENERACION_DISTRIBUIDA] WHERE ESTADO = 1 order by ID_SISTEMA ASC"), true);
    foreach ($datos as $item) {
        echo "<option ". ($item["M_FRECUENCIA"] == 1 ? "selected" : "") ." value='".$item["ID_SISTEMA"]."'>".$item["SISTEMA"]."</option>";
    }
}

function mostrarTiposSolicitudes(){
    $datos = json_decode(consultaGeneral("SELECT ID_SOL, LOWER(DESC_SOL)DESC_SOL, M_FRECUENCIA FROM [MEDICION_NETA].[dbo].[TIPOS_SOLICITUDES] WHERE ESTADO = 1 order by ID_SOL ASC"), true);
    foreach ($datos as $item) {
        echo "<input type='radio' class='btn-check' name='tipoSolicitud' data-descripcion='".ucwords($item["DESC_SOL"])."' id='".$item["ID_SOL"].$item["DESC_SOL"]."' value='".$item["ID_SOL"]."' autocomplete='off' ". ($item["M_FRECUENCIA"] == 1 ? "checked" : "") ."><label class='btn btn-outline-primary btn-tipoSol' for='".$item["ID_SOL"].$item["DESC_SOL"]."'>".$item["DESC_SOL"]."</label>
            ";
    }
}

function mostrarTiposDocumentos(){
    $datos = json_decode(consultaGeneral("SELECT ID_DOC, ABR_DOC, M_FRECUENCIA FROM [MEDICION_NETA].[dbo].[TIPO_DOCUMENTO] WHERE ESTADO = 1 order by ID_DOC ASC"), true);
    foreach ($datos as $item) {
        echo "<input id='".$item["ID_DOC"].$item["ABR_DOC"]."' class='form-check-input mt-0' name='tipoDocumento' type='radio' value='".$item["ID_DOC"]."' ". ($item["M_FRECUENCIA"] == 1 ? "checked" : "") .">
        <label for='".$item["ID_DOC"].$item["ABR_DOC"]."' class='mx-1'>".$item["ABR_DOC"]."</label>
        <span>&nbsp;</span>";
    }
}

function consultarCliente($NIC){
    $query = "SELECT nic, nis_rad, CONCAT(nombre_cliente, ' ', apellido_cliente, ' ', apellido_cliente2)nombre,
    documento_identificador,stcd.circuito,centro_transformacion,
    concat(localidad, ' ', calle, ' ', numero_puerta, ', ', provincia) as direccion_cliente,
    stt.potencia, stt.propietario, stt.tipo_conexion, stt.estado, stt.cantidad_salbt as cantidad_clientes,
    telefono_cliente,
    CASE 
      WHEN tarifa in ('B1A','BA1','BN1','BP1','BT1','PN1','PN2') THEN 'BTS1'
	  WHEN tarifa in ('B2A','BA2','BN2','BT2','CP2') THEN 'BTS2'
	  WHEN tarifa in ('BAD','BDA','BNA','BND','BTD','CPD') THEN 'BTD'
	  WHEN tarifa in ('BHA','BNH','BTH') THEN 'BTH'
      WHEN tarifa in ('BNB')  THEN 'Bonoluz'
      WHEN tarifa in ('AT1','CPM','M1A','MA1','MN1','MT1') THEN 'MTD1'
      WHEN tarifa in ('AT2','M2A','MA2','MN2','MT2') THEN 'MTD2'
      WHEN tarifa in ('MNH','MTH') THEN 'MTH'
      WHEN tarifa in ('MNA') THEN 'Totalizador'
      ELSE tarifa
    END as tarifa,
    SUBSTRING(sector,4) as sector,
    municipio,provincia 
    FROM stg_tbl_clientes_diarios stcd
    left join public.stg_tbl_transformadores stt on stt.matricula  = stcd.centro_transformacion
    WHERE NIC = '$NIC' AND estado_suministro NOT ILIKE 'baja%'";
    $result = pg_query(conectarCLTD(), $query);

    if (pg_num_rows($result) > 0) {
        $datos = pg_fetch_assoc($result);
        echo json_encode($datos);
    }
    // pg_free_result($result);
}

function consultarPerfil($usuario){
    $datos = json_decode(consultaGeneral("SELECT u.ID_PERF, NOMBRE, pf.PERFIL FROM [MEDICION_NETA].[acceso].[USUARIOS] u left join acceso.PERFILES pf on pf.ID_PERF = u.ID_PERF WHERE u.ESTADO = 1 AND UPPER(USUARIO_RED) = '".strtoupper($usuario)."'"), true);
    if(!empty($datos)){
        $_SESSION['ID_PERF'] = $datos[0]['ID_PERF'];
        $_SESSION['PERFIL'] = $datos[0]['PERFIL'];
        $_SESSION['NOMBRE'] = $datos[0]['NOMBRE'];
        return 1;
    } else {
        return 0;
    }
}

function inicioSesion($usuario, $contrasena){
    $ldap_conn = conectarLDAp();
    $usuario = strtolower(trim(htmlspecialchars($usuario, ENT_QUOTES, 'UTF-8')))."@".DOMINIO_LDAP;
    $contrasena = trim(htmlspecialchars($contrasena, ENT_QUOTES, 'UTF-8'));
    if($ldap_conn) {
        $ldap_bind = @ldap_bind(conectarLDAp(), $usuario, $contrasena);
        if($ldap_bind){
            ldap_unbind($ldap_conn);
            return 1;
        }else{
            return 0;
        }
    } else{
        return 0;
    }
}

function PermisosPagina(){
    if(isset($_SESSION['usuario'])){
        try{
            $url= $_SERVER["REQUEST_URI"];
            // $pagina = str_replace('/', '', $url);
            // echo $pagina;
            $pathParts = explode('/', $url);
            $pagina = end($pathParts);
            $pagina = strtolower(str_replace(array(".php", ".html", ".js"), '',$pagina));
            
            $paginasExentas = array("dashboard","g1");

            if(in_array($pagina, $paginasExentas)) {
                return true;
            }

            $permiso = false;
            $conn = conectarBDMN();
            $sql = "SELECT * FROM obtenerPermisos WHERE ID_PERF = '".$_SESSION['ID_PERF']."' AND ENLACE ='".strtolower($pagina)."'";
            $obtenerDatos = sqlsrv_query($conn, $sql);
            if($obtenerDatos == FALSE)
                die(print_r(sqlsrv_errors(),true));
            while($row = sqlsrv_fetch_array($obtenerDatos, SQLSRV_FETCH_ASSOC)){
                $permiso = true;
            }
            return $permiso;
            
            sqlsrv_free_stmt($obtenerDatos);
            sqlsrv_close($conn);
        }catch(Exception $e){
            echo("Error " . $e);
        }
    }
}

function registrarContratista($ID_CTR,$nombre, $rnc, $telefono, $correo, $correo2){
    echo json_encode(insertarGeneral("EXEC ActualizarContratista '".$ID_CTR."','".strtoupper(trim($nombre))."', '".trim($rnc)."', '".trim($telefono)."', '".trim($correo)."', '".trim($correo2)."', '".strtoupper($_SESSION['usuario'])."'"), true);
}

function consultarContratista($ID_CTR){
    $datos = json_decode(consultaGeneral("SELECT NOMBRE_CTR, RNC, TELEFONO, CORREO, CORREO2 FROM [MEDICION_NETA].[dbo].[CONTRATISTAS] WHERE ID_CTR = $ID_CTR"), true);
    echo json_encode($datos);
}

function consultarRadiacion($sectorCliente, $provinciaCliente, $municipioCliente){
    $datos = json_decode(consultaGeneral("SELECT TOP 1 *
    FROM (
        SELECT *, 1 AS Prioridad
        FROM [MEDICION_NETA].[dbo].[RADIACION]
        WHERE
            MUNICIPIO = '$municipioCliente' AND PROVINCIA = '$provinciaCliente' AND SECTOR = '$sectorCliente'
        UNION ALL
        SELECT *, 2 AS Prioridad
        FROM [MEDICION_NETA].[dbo].[RADIACION]
        WHERE
            MUNICIPIO IS NULL AND PROVINCIA = '$provinciaCliente' AND SECTOR = '$sectorCliente'
        UNION ALL
        SELECT *, 2 AS Prioridad
        FROM [MEDICION_NETA].[dbo].[RADIACION]
        WHERE
            MUNICIPIO IS NULL AND PROVINCIA IS NULL AND SECTOR = '$sectorCliente'
    ) Subconsulta
    ORDER BY Prioridad;"), true);
    echo json_encode($datos);
}

function ActualizarRepresentanteAutorizado($ID_REP_AUT, $NOMBRE_REP, $CEDULA, $ID_CARGO, $ASIENTO_SOCIAL, $DIR_REP, $TELEFONO, $ID_EST_CIVIL){
    return json_encode(insertarGeneral("EXEC ActualizarRepresentanteAutorizado '".intval($ID_REP_AUT)."','".trim($NOMBRE_REP)."', '".trim($CEDULA)."', '".$ID_CARGO."', '".trim($ASIENTO_SOCIAL)."','".trim($DIR_REP)."','".$TELEFONO."','".$ID_EST_CIVIL."'"), true);
}

function ActualizarSolicitud($ID_SOL,$NIC,$ID_TIPO_SOL,$NOMBRE_CLT,$ID_EST_CIVIL,$ID_TIPO_DOC,$NUM_DOC,$TELEFONO_CLT,$TARIFA,$DIR_SISTEMA,$COORDENADAS,$SECTOR,$PROVINCIA,$MUNICIPIO,$RADIACION,$ID_UBI_PROY,$ID_TEC_SISTEMA,$ID_CTR,$INVERSORES_KW,$KWP,$GEN_SISTEMA,$PROM_CSMO,$KW_INV_INST_ACT,$KW_PAN_INST_ACT,$CON_TRANSFORMADOR,$ID_REP_AUT){

    $ID_REP_AUT = (empty($ID_REP_AUT)) ? 'NULL' : $ID_REP_AUT;

    return json_encode(insertarGeneral("EXEC ActualizarSolicitud '".intval($ID_SOL)."','".$NIC."','".intval($ID_TIPO_SOL)."','".strtoupper(trim($NOMBRE_CLT))."','".intval($ID_EST_CIVIL)."','".intval($ID_TIPO_DOC)."','".trim($NUM_DOC)."','".trim($TELEFONO_CLT)."','".trim($TARIFA)."','".trim($DIR_SISTEMA)."','".trim($COORDENADAS)."','".$SECTOR."','".$PROVINCIA."','".$MUNICIPIO."','".$RADIACION."','".intval($ID_UBI_PROY)."','".intval($ID_TEC_SISTEMA)."','".intval($ID_CTR)."','".$INVERSORES_KW."','".$KWP."','".$GEN_SISTEMA."','".$PROM_CSMO."','".$KW_INV_INST_ACT."','".$KW_PAN_INST_ACT."','".trim($CON_TRANSFORMADOR)."',".$ID_REP_AUT.",'".strtoupper($_SESSION['usuario'])."'"), true);
}

function limpiarDatos($datoPOST) {
    $datosLimpios = array();
    foreach ($datoPOST as $clave => $valor) {
        $datosLimpios[$clave] = trim(htmlspecialchars(strip_tags(str_replace(array("'", '"'), '',$valor)), ENT_QUOTES, 'UTF-8'));
    }
    return $datosLimpios;
}

function guardarDetalleInversores($ID_SOL, $listaInversores){
    insertarGeneral("INSERT INTO H_DETALLE_INVERSORES_SOL (ID_SOL, CANT, KW_UNI, ID_MARCA, ID_MODELO, USUARIO, F_REGISTRO)  SELECT ID_SOL, CANT, KW_UNI, ID_MARCA, ID_MODELO, USUARIO, F_REGISTRO FROM DETALLE_INVERSORES_SOL WHERE ID_SOL = '".intval($ID_SOL)."';");

    eliminarGeneral("DELETE FROM DETALLE_INVERSORES_SOL WHERE ID_SOL = '".intval($ID_SOL)."';");
        
    $datos = json_decode(insertarGeneral("INSERT INTO [DETALLE_INVERSORES_SOL](ID_SOL,CANT,KW_UNI,ID_MARCA,ID_MODELO,USUARIO) VALUES".$listaInversores.";"), true);
}

function guardarDetallePaneles($ID_SOL, $listaPaneles){
    insertarGeneral("INSERT INTO H_DETALLE_PANELES_SOL (ID_SOL, CANT, KW_UNI, ID_MARCA, ID_MODELO, USUARIO, F_REGISTRO)  SELECT ID_SOL, CANT, KW_UNI, ID_MARCA, ID_MODELO, USUARIO, F_REGISTRO FROM DETALLE_PANELES_SOL WHERE ID_SOL = '".intval($ID_SOL)."';");

    eliminarGeneral("DELETE FROM DETALLE_PANELES_SOL WHERE ID_SOL = '".intval($ID_SOL)."';");

    $datos = json_decode(insertarGeneral("INSERT INTO [DETALLE_PANELES_SOL](ID_SOL,CANT,KW_UNI,ID_MARCA,ID_MODELO,USUARIO) VALUES".$listaPaneles.";"), true);
}

function consultarSolicitud($NIC){
    $datosCliente = json_decode(consultaGeneral("SELECT top(1) format(s.FECHA_REGISTRO, 'dd/MM/yyyy')FECHA_REGISTRO, s.ID_SOL, s.ID_CTR, s.NIC, ts.DESC_SOL,
    s.NOMBRE_CLT, ec.DESC_ESTADO, s.ID_TIPO_DOC, td.ABR_DOC, s.NUM_DOC, s.TELEFONO_CLT, s.TARIFA, s.DIR_SISTEMA, s.SECTOR, s.ID_UBI_PROY,  ui.DESC_UBI, sgd.SISTEMA, c.NOMBRE_CTR, c.RNC, c.TELEFONO as TELEFONO_CTR,
    s.INVERSORES_KW, s.KWP, s.PROM_CSMO,s.CON_TRANSFORMADOR, s.COORDENADAS, s.RADIACION,ra.ID_REP_AUT, ra.NOMBRE_REP, ra.CEDULA as CED_REP, ra.ID_CARGO, ra.ASIENTO_SOCIAL, ra.DIR_REP, ra.TELEFONO as TEL_REP, ra.ID_EST_CIVIL as ID_EST_CIVIL_REP, s.KW_PAN_INST_ACT, s.KW_INV_INST_ACT
    FROM SOLICITUDES s
    LEFT JOIN TIPOS_SOLICITUDES ts ON ts.ID_SOL = s.ID_TIPO_SOL 
    LEFT JOIN TIPO_DOCUMENTO td on td.ID_DOC = s.ID_TIPO_DOC 
    LEFT JOIN ESTADOS_CIVILES ec on ec.ID_ESTADO = s.ID_EST_CIVIL 
    LEFT JOIN UBICACION_INSTALACION ui on ui.ID_UBI_INST = s.ID_UBI_PROY 
    LEFT JOIN SISTEMAS_GENERACION_DISTRIBUIDA sgd on sgd.ID_SISTEMA = s.ID_TEC_SISTEMA 
    LEFT JOIN CONTRATISTAS c on c.ID_CTR = s.ID_CTR 
    LEFT JOIN REPRESENTANTES_AUTORIZADOS ra on ra.ID_REP_AUT = s.ID_REP_AUT 
    WHERE s.NIC = '".$NIC."'
    ORDER BY s.FECHA_REGISTRO DESC;"), true);

     $datosInversores = json_decode(consultaGeneral("SELECT * FROM DETALLE_INVERSORES_SOL
     WHERE ID_SOL = '".$datosCliente[0]["ID_SOL"]."';"), true);

    $datosPaneles = json_decode(consultaGeneral("SELECT * FROM DETALLE_PANELES_SOL
    WHERE ID_SOL = '".$datosCliente[0]["ID_SOL"]."';"), true);

    foreach ($datosInversores as $inversor) {
        $datosCliente[0]['INVERSORES'][] = $inversor;
    }

    foreach ($datosPaneles as $paneles) {
        $datosCliente[0]['PANELES'][] = $paneles;
    }

    echo json_encode($datosCliente, JSON_UNESCAPED_UNICODE);
}


// Funciones documentos
function cargarDatosCartaNoObjecion($NIC){
    $datosCliente = json_decode(consultaGeneral("SELECT top(1) format(s.FECHA_REGISTRO, 'dd/MM/yyyy')FECHA_REGISTRO, s.ID_SOL, s.NIC, ts.DESC_SOL,
    s.NOMBRE_CLT, ec.DESC_ESTADO, td.DESC_DOC, s.NUM_DOC, s.TELEFONO_CLT, s.TARIFA, s.DIR_SISTEMA, s.SECTOR,
    s.PROVINCIA, s.MUNICIPIO, s.ID_UBI_PROY,  ui.DESC_UBI, sgd.SISTEMA, c.NOMBRE_CTR, c.RNC, c.TELEFONO as TELEFONO_CTR,
    s.INVERSORES_KW, s.KWP, s.KW_INV_INST_ACT, s.KW_PAN_INST_ACT, c.NOMBRE_CTR, q2.CIRCUITO
    FROM SOLICITUDES s
    LEFT JOIN TIPOS_SOLICITUDES ts ON ts.ID_SOL = s.ID_TIPO_SOL 
    LEFT JOIN TIPO_DOCUMENTO td on td.ID_DOC = s.ID_TIPO_DOC 
    LEFT JOIN ESTADOS_CIVILES ec on ec.ID_ESTADO = s.ID_EST_CIVIL 
    LEFT JOIN UBICACION_INSTALACION ui on ui.ID_UBI_INST = s.ID_UBI_PROY 
    LEFT JOIN SISTEMAS_GENERACION_DISTRIBUIDA sgd on sgd.ID_SISTEMA = s.ID_TEC_SISTEMA 
    LEFT JOIN CONTRATISTAS c on c.ID_CTR = s.ID_CTR 
    LEFT JOIN REPRESENTANTES_AUTORIZADOS ra on ra.ID_REP_AUT = s.ID_REP_AUT 
    LEFT JOIN (
    	   SELECT dvn.nic, cmc.circuito 
	   FROM [ENSRPTS01].[INDICADORES TEMP].[gen].[CIRC_MAT_COORD] cmc
	   LEFT JOIN [ENSRPTS01].[PROYECTOS].[dbo].[deuda_venc_new] dvn ON dvn.nis_rad = cmc.nis
    )q2 ON q2.nic = s.nic
    WHERE s.NIC = '".$NIC."'
    ORDER BY s.FECHA_REGISTRO DESC;"), true);

    $datosInversores = json_decode(consultaGeneral("SELECT DIS.ID_SOL,ROUND((DIS.CANT*DIS.KW_UNI),2)CAPACIDAD, DIS.CANT, DIS.KW_UNI,mi.DESC_MARCA, mi2.DESC_MODELO 
    FROM DETALLE_INVERSORES_SOL dis 
    LEFT JOIN MARCAS_INVERSORES mi ON mi.ID_MARCA = dis.ID_MARCA 
    LEFT JOIN MODELOS_INVERSORES mi2 on mi2.ID_MODELO = dis.ID_MODELO
    WHERE dis.ID_SOL = '".$datosCliente[0]["ID_SOL"]."';"), true);

    $datosPaneles = json_decode(consultaGeneral("SELECT dps.ID_SOL,ROUND(((dps.CANT*dps.KW_UNI)/1000), 2)CAPACIDAD, dps.CANT, dps.KW_UNI,mmf.DESC_MARCA, mmf2.DESC_MODELO 
    FROM DETALLE_PANELES_SOL dps 
    LEFT JOIN MARCAS_MODULOS_FOTOVOLTAICOS mmf ON mmf.ID_MARCA = dps.ID_MARCA 
    LEFT JOIN MODELOS_MODULOS_FOTOVOLTAICOS mmf2 on mmf2.ID_MODELO = dps.ID_MODELO 
    WHERE dps.ID_SOL = '".$datosCliente[0]["ID_SOL"]."';"), true);

    foreach ($datosInversores as $inversor) {
        $datosCliente[0]['INVERSORES'][] = $inversor;
    }

    foreach ($datosPaneles as $paneles) {
        $datosCliente[0]['PANELES'][] = $paneles;
    }

    echo json_encode($datosCliente, JSON_UNESCAPED_UNICODE);
}

function cargarDatosAcuerdos($NIC){
    $datosCliente = json_decode(consultaGeneral("SELECT top(1) format(s.FECHA_REGISTRO, 'dd/MM/yyyy')FECHA_REGISTRO, s.ID_SOL, s.NIC, ts.DESC_SOL,
    s.NOMBRE_CLT, ec.DESC_ESTADO, td.DESC_DOC, s.NUM_DOC, s.TELEFONO_CLT, s.TARIFA, s.DIR_SISTEMA, s.SECTOR,
    s.PROVINCIA, s.MUNICIPIO,  ui.DESC_UBI, sgd.SISTEMA, c.NOMBRE_CTR, c.RNC, c.TELEFONO as TELEFONO_CTR,
    s.INVERSORES_KW, s.KWP, ROUND(s.KW_INV_INST_ACT, 2) KW_INV_INST_ACT, ROUND(s.KW_PAN_INST_ACT, 2)KW_PAN_INST_ACT
    ,ra.NOMBRE_REP, ra.CEDULA as CEDULA_REP, ra.ASIENTO_SOCIAL, ra.DIR_REP, ecre.DESC_ESTADO AS ESTADO_CIVIL_REP, ec.DESC_ESTADO as ESTADO_CIVIL_CLT,cr.DESC_CARGO,ra.DIR_REP,s.CON_TRANSFORMADOR,ct.VOLTAJE
    FROM SOLICITUDES s
    LEFT JOIN TIPOS_SOLICITUDES ts ON ts.ID_SOL = s.ID_TIPO_SOL 
    LEFT JOIN TIPO_DOCUMENTO td on td.ID_DOC = s.ID_TIPO_DOC 
    LEFT JOIN ESTADOS_CIVILES ec on ec.ID_ESTADO = s.ID_EST_CIVIL 
    LEFT JOIN UBICACION_INSTALACION ui on ui.ID_UBI_INST = s.ID_UBI_PROY 
    LEFT JOIN SISTEMAS_GENERACION_DISTRIBUIDA sgd on sgd.ID_SISTEMA = s.ID_TEC_SISTEMA 
    LEFT JOIN CONTRATISTAS c on c.ID_CTR = s.ID_CTR 
    LEFT JOIN REPRESENTANTES_AUTORIZADOS ra on ra.ID_REP_AUT = s.ID_REP_AUT 
    LEFT JOIN ESTADOS_CIVILES ecre on ecre.ID_ESTADO = ra.ID_EST_CIVIL 
    LEFT JOIN CARGOS_REPRESENTANTES cr on cr.ID_CARGO_REPR = ra.ID_CARGO
    LEFT JOIN CON_TRANSFORMADORES ct ON ct.CON_TRANSFORMADOR = s.CON_TRANSFORMADOR
    WHERE s.NIC = '".$NIC."'
    ORDER BY s.FECHA_REGISTRO DESC;"), true);

    echo json_encode($datosCliente, JSON_UNESCAPED_UNICODE);
}



//Datos graficos
function KWPSolicitadosAnual(){
    $datos = json_decode(consultaGeneral("select upper(format(s.FECHA_REGISTRO,'MMMM yyyy','es-ES'))anio_mes, sum(s.KWp)KWp
    from SOLICITUDES s 
    left join CONTRATISTAS c on c.ID_CTR = s.ID_CTR 
    group by format(s.FECHA_REGISTRO,'MMMM yyyy','es-ES')"), true);
    echo json_encode($datos);
}


function sql($SQL){
    echo eliminarGeneral($SQL);
}

?>

