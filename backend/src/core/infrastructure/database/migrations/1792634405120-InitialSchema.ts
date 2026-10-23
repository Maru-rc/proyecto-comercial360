import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792634405120 implements MigrationInterface {
  name = 'InitialSchema1792634405120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "zona" ("id_zona" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_98d9092625727fb46bc4aa13237" UNIQUE ("nombre"), CONSTRAINT "PK_b5e8b38e8044e0e06925c92f2a2" PRIMARY KEY ("id_zona"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "tipo_cliente" ("id_tipo_cliente" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_2e15ebf78706e4b2f7547e1d312" UNIQUE ("nombre"), CONSTRAINT "PK_021b080acace64fdd81fa3bd27c" PRIMARY KEY ("id_tipo_cliente"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "potencial" ("id_potencial" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "orden" integer NOT NULL, CONSTRAINT "UQ_e471047982d0ab6fcb74e85e26f" UNIQUE ("nombre"), CONSTRAINT "PK_7bc4adf4410323b36ccbafac745" PRIMARY KEY ("id_potencial"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "estado_cliente" ("id_estado_cliente" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_1af67fbe5624a8b38f2a200b102" UNIQUE ("nombre"), CONSTRAINT "PK_a79c785c0d93b5e6f0c1338fda0" PRIMARY KEY ("id_estado_cliente"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contacto_cliente" ("id_contacto" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "cargo" character varying(100), "telefono" character varying(20), "celular" character varying(20), "email" character varying(150), "principal" boolean NOT NULL DEFAULT false, "id_cliente" integer, CONSTRAINT "PK_ca547781229b0c378379f0ca94f" PRIMARY KEY ("id_contacto"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cliente" ("id_cliente" SERIAL NOT NULL, "nit" character varying(20) NOT NULL, "razon_social" character varying(200) NOT NULL, "nombre_comercial" character varying(200), "direccion" character varying(300), "departamento" character varying(100), "municipio" character varying(100), "barrio" character varying(100), "telefono" character varying(20), "email" character varying(150), "latitud" numeric(10,7), "longitud" numeric(10,7), "frecuencia_visita_dias" integer, "fecha_creacion" TIMESTAMP NOT NULL DEFAULT now(), "activo" boolean NOT NULL DEFAULT true, "id_zona" integer, "id_tipo_cliente" integer, "id_potencial" integer, "id_estado_cliente" integer, CONSTRAINT "UQ_3a722445847d37bb66f41e1c168" UNIQUE ("nit"), CONSTRAINT "PK_dbf4725e2849f4036253ee7dbd0" PRIMARY KEY ("id_cliente"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "portafolio" ("id_portafolio" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, "descripcion" text, CONSTRAINT "UQ_933eaa43fa151c1903b5d8d37c0" UNIQUE ("nombre"), CONSTRAINT "PK_aedbe9c9e81f7f51c2c9126530a" PRIMARY KEY ("id_portafolio"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cliente_portafolio" ("id_cliente_portafolio" SERIAL NOT NULL, "fecha_registro" TIMESTAMP NOT NULL DEFAULT now(), "id_cliente" integer, "id_portafolio" integer, CONSTRAINT "PK_495cc9263a6e0ea32ca6155f649" PRIMARY KEY ("id_cliente_portafolio"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "historial_cliente" ("id_historial" SERIAL NOT NULL, "id_cliente" integer NOT NULL, "fecha" TIMESTAMP NOT NULL DEFAULT now(), "accion" character varying(100) NOT NULL, "usuario" character varying(150) NOT NULL, "descripcion" text, CONSTRAINT "PK_f0a65996c953d0e9cba345916b3" PRIMARY KEY ("id_historial"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e0cca55ef7e112acd876ba6698" ON "historial_cliente"  ("id_cliente", "fecha") `,
    );
    await queryRunner.query(
      `CREATE TABLE "asesor" ("id_asesor" SERIAL NOT NULL, "nombre" character varying(150) NOT NULL, "correo" character varying(150) NOT NULL, "telefono" character varying(20), "estado" character varying(20) NOT NULL DEFAULT 'ACTIVO', CONSTRAINT "UQ_e3db8a64df62e932a9a1f400aee" UNIQUE ("correo"), CONSTRAINT "PK_6ed9b30cdc516de7c40e1ac16b5" PRIMARY KEY ("id_asesor"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cotizacion" ("id_cotizacion" SERIAL NOT NULL, "numero" character varying(50) NOT NULL, "fecha" date NOT NULL, "valor" numeric(15,2) NOT NULL DEFAULT '0', "estado" character varying(30) NOT NULL DEFAULT 'ENVIADA', "moneda" character varying(10) NOT NULL DEFAULT 'COP', "id_cliente" integer, "id_asesor" integer, CONSTRAINT "UQ_d0d9025c56f5accfe6161a1b629" UNIQUE ("numero"), CONSTRAINT "PK_e46f12fabeba98182ce8ebdb85a" PRIMARY KEY ("id_cotizacion"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "cotizacion_detalle" ("id_detalle" SERIAL NOT NULL, "producto" character varying(200) NOT NULL, "cantidad" integer NOT NULL, "precio" numeric(15,2) NOT NULL, "subtotal" numeric(15,2) NOT NULL, "id_cotizacion" integer, CONSTRAINT "PK_8c3ac6d7524da5e1145ea744905" PRIMARY KEY ("id_detalle"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "pedido" ("id_pedido" SERIAL NOT NULL, "numero" character varying(50) NOT NULL, "fecha" date NOT NULL, "valor" numeric(15,2) NOT NULL DEFAULT '0', "estado" character varying(30) NOT NULL DEFAULT 'CERRADO', "fecha_entrega_estimada" date, "id_cliente" integer, "id_cotizacion" integer, CONSTRAINT "UQ_398f504766b1bc33d11b9df30ab" UNIQUE ("numero"), CONSTRAINT "PK_72dab98a1e27f9a1fabc394f64b" PRIMARY KEY ("id_pedido"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ruta" ("id_ruta" SERIAL NOT NULL, "nombre" character varying(200) NOT NULL, "fecha_inicio" date, "fecha_fin" date, "estado" character varying(30) NOT NULL DEFAULT 'BORRADOR', "dia_ejecucion" character varying(20), "frecuencia" character varying(20), "hora_inicio" TIME, "hora_fin" TIME, "descripcion" character varying(200), "id_asesor" integer, "id_zona" integer, CONSTRAINT "PK_26a5677b445ca25ad52aa2d8af5" PRIMARY KEY ("id_ruta"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ruta_cliente" ("id_ruta_cliente" SERIAL NOT NULL, "orden_visita" integer NOT NULL, "hora_sugerida" TIME, "id_ruta" integer, "id_cliente" integer, CONSTRAINT "PK_852ee2d0e78e632da442e9e74d7" PRIMARY KEY ("id_ruta_cliente"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "resultado_visita" ("id_resultado" SERIAL NOT NULL, "nombre" character varying(100) NOT NULL, CONSTRAINT "UQ_818cd9db6c59c680f39d7cb9215" UNIQUE ("nombre"), CONSTRAINT "PK_231102f7b76136ee89eed472665" PRIMARY KEY ("id_resultado"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "visita_resultado" ("id_visita_resultado" SERIAL NOT NULL, "observacion" text, "id_visita" integer, "id_resultado" integer, CONSTRAINT "PK_e605f3d7db48cfdd7c1cc3f5349" PRIMARY KEY ("id_visita_resultado"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "visita" ("id_visita" SERIAL NOT NULL, "fecha_programada" TIMESTAMP NOT NULL, "fecha_real" TIMESTAMP, "hora_fin" TIMESTAMP, "estado_visita" character varying(30) NOT NULL DEFAULT 'PENDIENTE', "objetivo" character varying(300), "tipo_visita" character varying(50), "interes" character varying(100), "competencia" character varying(200), "canal_contacto" character varying(50), "id_cliente" integer, "id_asesor" integer, "id_ruta" integer, "id_portafolio" integer, CONSTRAINT "PK_5a56cca69ab24a1bd71d50b83e4" PRIMARY KEY ("id_visita"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "adjunto" ("id_adjunto" SERIAL NOT NULL, "categoria" character varying(30) NOT NULL, "s3_key" character varying(500) NOT NULL, "nombre_original" character varying(255) NOT NULL, "tipo_mime" character varying(100) NOT NULL, "tamano" integer NOT NULL, "fecha_carga" TIMESTAMP NOT NULL DEFAULT now(), "usuario" character varying(150) NOT NULL, "id_visita" integer, CONSTRAINT "UQ_5d102fe0124720466b09913b1e0" UNIQUE ("s3_key"), CONSTRAINT "PK_d6bee45b6f12ada6e74856338f8" PRIMARY KEY ("id_adjunto"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab043b1da484664d5a17487022" ON "adjunto"  ("id_visita") `,
    );
    await queryRunner.query(
      `CREATE TABLE "seguimiento" ("id_seguimiento" SERIAL NOT NULL, "fecha_proxima" TIMESTAMP NOT NULL, "actividad" character varying(200), "observacion" text, "completado" boolean NOT NULL DEFAULT false, "id_visita" integer, "id_asesor_responsable" integer, CONSTRAINT "PK_7a288f4305d48c36527dae2d5d0" PRIMARY KEY ("id_seguimiento"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacto_cliente" ADD CONSTRAINT "FK_e967a9292c171d64e951a7270ac" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_89def68913fed4aaa582c3aeea2" FOREIGN KEY ("id_zona") REFERENCES "zona"("id_zona") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_a22bfd4e0c0bf10004a83a66547" FOREIGN KEY ("id_tipo_cliente") REFERENCES "tipo_cliente"("id_tipo_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_d3a8ca659c54866ecb76ef5b0e8" FOREIGN KEY ("id_potencial") REFERENCES "potencial"("id_potencial") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" ADD CONSTRAINT "FK_315b6f01dbaacfc460c1fbc38d5" FOREIGN KEY ("id_estado_cliente") REFERENCES "estado_cliente"("id_estado_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente_portafolio" ADD CONSTRAINT "FK_443af8534f0eacccab5d3bc1485" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente_portafolio" ADD CONSTRAINT "FK_2eb7102f9ad25a41b28452b7607" FOREIGN KEY ("id_portafolio") REFERENCES "portafolio"("id_portafolio") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "historial_cliente" ADD CONSTRAINT "FK_ff03942cfebdde78d0b05c29ad2" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion" ADD CONSTRAINT "FK_e1c19b8ad84f6fcf4f71632a18c" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion" ADD CONSTRAINT "FK_971ac7c96ffe488d394d677ce5a" FOREIGN KEY ("id_asesor") REFERENCES "asesor"("id_asesor") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion_detalle" ADD CONSTRAINT "FK_736948182d045f74541c5fba1ef" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizacion"("id_cotizacion") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido" ADD CONSTRAINT "FK_33471ba0a166506dbd244346ba6" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido" ADD CONSTRAINT "FK_ab0b05a3b9b83f6925ffdd41cdf" FOREIGN KEY ("id_cotizacion") REFERENCES "cotizacion"("id_cotizacion") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta" ADD CONSTRAINT "FK_cb378c67305ff4fadd0c0193653" FOREIGN KEY ("id_asesor") REFERENCES "asesor"("id_asesor") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta" ADD CONSTRAINT "FK_bad6ad841c0b5fc0e355779b3b5" FOREIGN KEY ("id_zona") REFERENCES "zona"("id_zona") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta_cliente" ADD CONSTRAINT "FK_123e6e4daeae0e927f29f62656c" FOREIGN KEY ("id_ruta") REFERENCES "ruta"("id_ruta") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta_cliente" ADD CONSTRAINT "FK_fb5c933d85c17906dafb5fb9f12" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita_resultado" ADD CONSTRAINT "FK_48467cc3251ba75f6f565b48d4a" FOREIGN KEY ("id_visita") REFERENCES "visita"("id_visita") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita_resultado" ADD CONSTRAINT "FK_c62da7b371048a15e7506e114ae" FOREIGN KEY ("id_resultado") REFERENCES "resultado_visita"("id_resultado") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" ADD CONSTRAINT "FK_2f8983bc5d181167f33ba3a952a" FOREIGN KEY ("id_cliente") REFERENCES "cliente"("id_cliente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" ADD CONSTRAINT "FK_ef857caf6462fbbfdec35b79d65" FOREIGN KEY ("id_asesor") REFERENCES "asesor"("id_asesor") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" ADD CONSTRAINT "FK_450ca807586cd20547adab387e2" FOREIGN KEY ("id_ruta") REFERENCES "ruta"("id_ruta") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" ADD CONSTRAINT "FK_6d3ae93f1df46627dd633f7a5b4" FOREIGN KEY ("id_portafolio") REFERENCES "portafolio"("id_portafolio") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "adjunto" ADD CONSTRAINT "FK_ab043b1da484664d5a174870227" FOREIGN KEY ("id_visita") REFERENCES "visita"("id_visita") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seguimiento" ADD CONSTRAINT "FK_284df519d9a5bcf0bb15c357361" FOREIGN KEY ("id_visita") REFERENCES "visita"("id_visita") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seguimiento" ADD CONSTRAINT "FK_895a95217f24666c44a1d97c0f8" FOREIGN KEY ("id_asesor_responsable") REFERENCES "asesor"("id_asesor") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seguimiento" DROP CONSTRAINT "FK_895a95217f24666c44a1d97c0f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seguimiento" DROP CONSTRAINT "FK_284df519d9a5bcf0bb15c357361"`,
    );
    await queryRunner.query(
      `ALTER TABLE "adjunto" DROP CONSTRAINT "FK_ab043b1da484664d5a174870227"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" DROP CONSTRAINT "FK_6d3ae93f1df46627dd633f7a5b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" DROP CONSTRAINT "FK_450ca807586cd20547adab387e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" DROP CONSTRAINT "FK_ef857caf6462fbbfdec35b79d65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita" DROP CONSTRAINT "FK_2f8983bc5d181167f33ba3a952a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita_resultado" DROP CONSTRAINT "FK_c62da7b371048a15e7506e114ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visita_resultado" DROP CONSTRAINT "FK_48467cc3251ba75f6f565b48d4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta_cliente" DROP CONSTRAINT "FK_fb5c933d85c17906dafb5fb9f12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta_cliente" DROP CONSTRAINT "FK_123e6e4daeae0e927f29f62656c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta" DROP CONSTRAINT "FK_bad6ad841c0b5fc0e355779b3b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ruta" DROP CONSTRAINT "FK_cb378c67305ff4fadd0c0193653"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido" DROP CONSTRAINT "FK_ab0b05a3b9b83f6925ffdd41cdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pedido" DROP CONSTRAINT "FK_33471ba0a166506dbd244346ba6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion_detalle" DROP CONSTRAINT "FK_736948182d045f74541c5fba1ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion" DROP CONSTRAINT "FK_971ac7c96ffe488d394d677ce5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cotizacion" DROP CONSTRAINT "FK_e1c19b8ad84f6fcf4f71632a18c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "historial_cliente" DROP CONSTRAINT "FK_ff03942cfebdde78d0b05c29ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente_portafolio" DROP CONSTRAINT "FK_2eb7102f9ad25a41b28452b7607"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente_portafolio" DROP CONSTRAINT "FK_443af8534f0eacccab5d3bc1485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_315b6f01dbaacfc460c1fbc38d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_d3a8ca659c54866ecb76ef5b0e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_a22bfd4e0c0bf10004a83a66547"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cliente" DROP CONSTRAINT "FK_89def68913fed4aaa582c3aeea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contacto_cliente" DROP CONSTRAINT "FK_e967a9292c171d64e951a7270ac"`,
    );
    await queryRunner.query(`DROP TABLE "seguimiento"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab043b1da484664d5a17487022"`,
    );
    await queryRunner.query(`DROP TABLE "adjunto"`);
    await queryRunner.query(`DROP TABLE "visita"`);
    await queryRunner.query(`DROP TABLE "visita_resultado"`);
    await queryRunner.query(`DROP TABLE "resultado_visita"`);
    await queryRunner.query(`DROP TABLE "ruta_cliente"`);
    await queryRunner.query(`DROP TABLE "ruta"`);
    await queryRunner.query(`DROP TABLE "pedido"`);
    await queryRunner.query(`DROP TABLE "cotizacion_detalle"`);
    await queryRunner.query(`DROP TABLE "cotizacion"`);
    await queryRunner.query(`DROP TABLE "asesor"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e0cca55ef7e112acd876ba6698"`,
    );
    await queryRunner.query(`DROP TABLE "historial_cliente"`);
    await queryRunner.query(`DROP TABLE "cliente_portafolio"`);
    await queryRunner.query(`DROP TABLE "portafolio"`);
    await queryRunner.query(`DROP TABLE "cliente"`);
    await queryRunner.query(`DROP TABLE "contacto_cliente"`);
    await queryRunner.query(`DROP TABLE "estado_cliente"`);
    await queryRunner.query(`DROP TABLE "potencial"`);
    await queryRunner.query(`DROP TABLE "tipo_cliente"`);
    await queryRunner.query(`DROP TABLE "zona"`);
  }
}
