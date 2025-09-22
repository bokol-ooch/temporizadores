En este proyecto se implementa una pagina web servida por express desarrollada en javascript donde tenemos una serie de temporizadores, uno por usuario donde cada uno elije un estante y un boton de inicio, al pulsar el bton captura el nombre, el estante y la hora de inicio, el boton iniciar abia por un botor finalizar y al pulsarlo muestra un resumen del estante y tiempo transucurrido. Tambien guarda la informacion en una base de datos de SQLite para un analisis y procesamiento posterior de los datos. Tabien incluye unos filtros y un boton para exportar los registros como csv.

![Pantalla inicial](Captura%20de%20pantalla%202025-09-22%20130900.png)

Cada temporizador funciona de manera independiente y teoricamente el servidor esta diseñado para ser concurrente, podria soportar diferentes usuarios a la vez, pero los nombres seran iguales
![Temporizadores funcionando](Captura%20de%20pantalla%202025-09-22%20130919.png)

Se puede filtrar toda la base de datos por usuario y / o por fecha. no esta implementado pero se puede agregar facilmente un filtro por estante.
![Detalle descarga csv](Captura%20de%20pantalla%202025-09-22%20130935.png)
