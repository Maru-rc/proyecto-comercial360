import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1792634405120 implements MigrationInterface {
  name = 'InitialSchema1792634405120';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "zones" ("zone_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_98d9092625727fb46bc4aa13237" UNIQUE ("name"), CONSTRAINT "PK_b5e8b38e8044e0e06925c92f2a2" PRIMARY KEY ("zone_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_types" ("customer_type_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_2e15ebf78706e4b2f7547e1d312" UNIQUE ("name"), CONSTRAINT "PK_021b080acace64fdd81fa3bd27c" PRIMARY KEY ("customer_type_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "potentials" ("potential_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "sort_order" integer NOT NULL, CONSTRAINT "UQ_e471047982d0ab6fcb74e85e26f" UNIQUE ("name"), CONSTRAINT "PK_7bc4adf4410323b36ccbafac745" PRIMARY KEY ("potential_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_statuses" ("customer_status_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_1af67fbe5624a8b38f2a200b102" UNIQUE ("name"), CONSTRAINT "PK_a79c785c0d93b5e6f0c1338fda0" PRIMARY KEY ("customer_status_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_contacts" ("contact_id" SERIAL NOT NULL, "name" character varying(150) NOT NULL, "position" character varying(100), "phone" character varying(20), "mobile_phone" character varying(20), "email" character varying(150), "is_primary" boolean NOT NULL DEFAULT false, "customer_id" integer, CONSTRAINT "PK_ca547781229b0c378379f0ca94f" PRIMARY KEY ("contact_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("customer_id" SERIAL NOT NULL, "tax_id" character varying(20) NOT NULL, "legal_name" character varying(200) NOT NULL, "commercial_name" character varying(200), "address" character varying(300), "department" character varying(100), "municipality" character varying(100), "neighborhood" character varying(100), "phone" character varying(20), "email" character varying(150), "latitude" numeric(10,7), "longitude" numeric(10,7), "visit_frequency_days" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "is_active" boolean NOT NULL DEFAULT true, "zone_id" integer, "customer_type_id" integer, "potential_id" integer, "customer_status_id" integer, CONSTRAINT "UQ_3a722445847d37bb66f41e1c168" UNIQUE ("tax_id"), CONSTRAINT "PK_dbf4725e2849f4036253ee7dbd0" PRIMARY KEY ("customer_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "portfolios" ("portfolio_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, CONSTRAINT "UQ_933eaa43fa151c1903b5d8d37c0" UNIQUE ("name"), CONSTRAINT "PK_aedbe9c9e81f7f51c2c9126530a" PRIMARY KEY ("portfolio_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_portfolios" ("customer_portfolio_id" SERIAL NOT NULL, "registered_at" TIMESTAMP NOT NULL DEFAULT now(), "customer_id" integer, "portfolio_id" integer, CONSTRAINT "PK_495cc9263a6e0ea32ca6155f649" PRIMARY KEY ("customer_portfolio_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "customer_history" ("customer_history_id" SERIAL NOT NULL, "customer_id" integer NOT NULL, "date" TIMESTAMP NOT NULL DEFAULT now(), "action" character varying(100) NOT NULL, "user" character varying(150) NOT NULL, "description" text, CONSTRAINT "PK_f0a65996c953d0e9cba345916b3" PRIMARY KEY ("customer_history_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e0cca55ef7e112acd876ba6698" ON "customer_history" ("customer_id", "date" DESC)`,
    );
    await queryRunner.query(
      `CREATE TABLE "quotes" ("quote_id" SERIAL NOT NULL, "quote_number" character varying(50) NOT NULL, "date" date NOT NULL, "amount" numeric(15,2) NOT NULL DEFAULT '0', "status" character varying(30) NOT NULL DEFAULT 'ENVIADA', "currency" character varying(10) NOT NULL DEFAULT 'COP', "customer_id" integer, "sales_representative_id" integer, CONSTRAINT "UQ_d0d9025c56f5accfe6161a1b629" UNIQUE ("quote_number"), CONSTRAINT "PK_e46f12fabeba98182ce8ebdb85a" PRIMARY KEY ("quote_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "quote_details" ("quote_detail_id" SERIAL NOT NULL, "product" character varying(200) NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(15,2) NOT NULL, "subtotal" numeric(15,2) NOT NULL, "quote_id" integer, CONSTRAINT "PK_8c3ac6d7524da5e1145ea744905" PRIMARY KEY ("quote_detail_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("order_id" SERIAL NOT NULL, "order_number" character varying(50) NOT NULL, "date" date NOT NULL, "amount" numeric(15,2) NOT NULL DEFAULT '0', "status" character varying(30) NOT NULL DEFAULT 'CERRADO', "estimated_delivery_date" date, "customer_id" integer, "quote_id" integer, CONSTRAINT "UQ_398f504766b1bc33d11b9df30ab" UNIQUE ("order_number"), CONSTRAINT "PK_72dab98a1e27f9a1fabc394f64b" PRIMARY KEY ("order_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "routes" ("route_id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "start_date" date, "end_date" date, "status" character varying(30) NOT NULL DEFAULT 'BORRADOR', "execution_day" character varying(20), "frequency" character varying(20), "start_time" TIME, "end_time" TIME, "description" character varying(200), "sales_representative_id" integer, "zone_id" integer, CONSTRAINT "PK_26a5677b445ca25ad52aa2d8af5" PRIMARY KEY ("route_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "route_stops" ("route_stop_id" SERIAL NOT NULL, "visit_order" integer NOT NULL, "suggested_time" TIME, "route_id" integer, "customer_id" integer, CONSTRAINT "PK_852ee2d0e78e632da442e9e74d7" PRIMARY KEY ("route_stop_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "visit_outcomes" ("visit_outcome_id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "UQ_818cd9db6c59c680f39d7cb9215" UNIQUE ("name"), CONSTRAINT "PK_231102f7b76136ee89eed472665" PRIMARY KEY ("visit_outcome_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "visit_results" ("visit_result_id" SERIAL NOT NULL, "observation" text, "visit_id" integer, "visit_outcome_id" integer, CONSTRAINT "PK_e605f3d7db48cfdd7c1cc3f5349" PRIMARY KEY ("visit_result_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "visits" ("visit_id" SERIAL NOT NULL, "scheduled_at" TIMESTAMP NOT NULL, "actual_at" TIMESTAMP, "end_time" TIMESTAMP, "visit_status" character varying(30) NOT NULL DEFAULT 'PENDIENTE', "objective" character varying(300), "visit_type" character varying(50), "interest" character varying(100), "competitor" character varying(200), "contact_channel" character varying(50), "customer_id" integer, "sales_representative_id" integer, "route_id" integer, "portfolio_id" integer, CONSTRAINT "PK_5a56cca69ab24a1bd71d50b83e4" PRIMARY KEY ("visit_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachments" ("attachment_id" SERIAL NOT NULL, "category" character varying(30) NOT NULL, "s3_key" character varying(500) NOT NULL, "original_name" character varying(255) NOT NULL, "mime_type" character varying(100) NOT NULL, "size" integer NOT NULL, "uploaded_at" TIMESTAMP NOT NULL DEFAULT now(), "user" character varying(150) NOT NULL, "visit_id" integer, CONSTRAINT "UQ_5d102fe0124720466b09913b1e0" UNIQUE ("s3_key"), CONSTRAINT "PK_d6bee45b6f12ada6e74856338f8" PRIMARY KEY ("attachment_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ab043b1da484664d5a17487022" ON "attachments"  ("visit_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "follow_ups" ("follow_up_id" SERIAL NOT NULL, "next_date" TIMESTAMP NOT NULL, "activity" character varying(200), "observation" text, "is_completed" boolean NOT NULL DEFAULT false, "visit_id" integer, "responsible_sales_representative_id" integer, CONSTRAINT "PK_7a288f4305d48c36527dae2d5d0" PRIMARY KEY ("follow_up_id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_contacts" ADD CONSTRAINT "FK_e967a9292c171d64e951a7270ac" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_89def68913fed4aaa582c3aeea2" FOREIGN KEY ("zone_id") REFERENCES "zones"("zone_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_a22bfd4e0c0bf10004a83a66547" FOREIGN KEY ("customer_type_id") REFERENCES "customer_types"("customer_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_d3a8ca659c54866ecb76ef5b0e8" FOREIGN KEY ("potential_id") REFERENCES "potentials"("potential_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" ADD CONSTRAINT "FK_315b6f01dbaacfc460c1fbc38d5" FOREIGN KEY ("customer_status_id") REFERENCES "customer_statuses"("customer_status_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_portfolios" ADD CONSTRAINT "FK_443af8534f0eacccab5d3bc1485" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_portfolios" ADD CONSTRAINT "FK_2eb7102f9ad25a41b28452b7607" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("portfolio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_history" ADD CONSTRAINT "FK_ff03942cfebdde78d0b05c29ad2" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD CONSTRAINT "FK_e1c19b8ad84f6fcf4f71632a18c" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" ADD CONSTRAINT "FK_971ac7c96ffe488d394d677ce5a" FOREIGN KEY ("sales_representative_id") REFERENCES "sales_representatives"("sales_representative_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quote_details" ADD CONSTRAINT "FK_736948182d045f74541c5fba1ef" FOREIGN KEY ("quote_id") REFERENCES "quotes"("quote_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_33471ba0a166506dbd244346ba6" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_ab0b05a3b9b83f6925ffdd41cdf" FOREIGN KEY ("quote_id") REFERENCES "quotes"("quote_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "routes" ADD CONSTRAINT "FK_cb378c67305ff4fadd0c0193653" FOREIGN KEY ("sales_representative_id") REFERENCES "sales_representatives"("sales_representative_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "routes" ADD CONSTRAINT "FK_bad6ad841c0b5fc0e355779b3b5" FOREIGN KEY ("zone_id") REFERENCES "zones"("zone_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_stops" ADD CONSTRAINT "FK_123e6e4daeae0e927f29f62656c" FOREIGN KEY ("route_id") REFERENCES "routes"("route_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_stops" ADD CONSTRAINT "FK_fb5c933d85c17906dafb5fb9f12" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visit_results" ADD CONSTRAINT "FK_48467cc3251ba75f6f565b48d4a" FOREIGN KEY ("visit_id") REFERENCES "visits"("visit_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visit_results" ADD CONSTRAINT "FK_c62da7b371048a15e7506e114ae" FOREIGN KEY ("visit_outcome_id") REFERENCES "visit_outcomes"("visit_outcome_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" ADD CONSTRAINT "FK_2f8983bc5d181167f33ba3a952a" FOREIGN KEY ("customer_id") REFERENCES "customers"("customer_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" ADD CONSTRAINT "FK_ef857caf6462fbbfdec35b79d65" FOREIGN KEY ("sales_representative_id") REFERENCES "sales_representatives"("sales_representative_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" ADD CONSTRAINT "FK_450ca807586cd20547adab387e2" FOREIGN KEY ("route_id") REFERENCES "routes"("route_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" ADD CONSTRAINT "FK_6d3ae93f1df46627dd633f7a5b4" FOREIGN KEY ("portfolio_id") REFERENCES "portfolios"("portfolio_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" ADD CONSTRAINT "FK_ab043b1da484664d5a174870227" FOREIGN KEY ("visit_id") REFERENCES "visits"("visit_id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_ups" ADD CONSTRAINT "FK_284df519d9a5bcf0bb15c357361" FOREIGN KEY ("visit_id") REFERENCES "visits"("visit_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_ups" ADD CONSTRAINT "FK_895a95217f24666c44a1d97c0f8" FOREIGN KEY ("responsible_sales_representative_id") REFERENCES "sales_representatives"("sales_representative_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customer_contacts_customer_id" ON "customer_contacts" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customers_zone_id" ON "customers" ("zone_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customers_customer_type_id" ON "customers" ("customer_type_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customers_potential_id" ON "customers" ("potential_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customers_customer_status_id" ON "customers" ("customer_status_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customer_portfolios_customer_id" ON "customer_portfolios" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_customer_portfolios_portfolio_id" ON "customer_portfolios" ("portfolio_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quotes_customer_id" ON "quotes" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quotes_sales_representative_id" ON "quotes" ("sales_representative_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_quote_details_quote_id" ON "quote_details" ("quote_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_customer_id" ON "orders" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_quote_id" ON "orders" ("quote_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_routes_sales_representative_id" ON "routes" ("sales_representative_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_routes_zone_id" ON "routes" ("zone_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_route_stops_route_id" ON "route_stops" ("route_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_route_stops_customer_id" ON "route_stops" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visit_results_visit_id" ON "visit_results" ("visit_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visit_results_visit_outcome_id" ON "visit_results" ("visit_outcome_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visits_customer_id" ON "visits" ("customer_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visits_sales_representative_id" ON "visits" ("sales_representative_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visits_route_id" ON "visits" ("route_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_visits_portfolio_id" ON "visits" ("portfolio_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_follow_ups_visit_id" ON "follow_ups" ("visit_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_follow_ups_responsible_sales_representative_id" ON "follow_ups" ("responsible_sales_representative_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_follow_ups_responsible_sales_representative_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_follow_ups_visit_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_visits_portfolio_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_visits_route_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_visits_sales_representative_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_visits_customer_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_visit_results_visit_outcome_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_visit_results_visit_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_route_stops_customer_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_route_stops_route_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_routes_zone_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_routes_sales_representative_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_quote_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_orders_customer_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_quote_details_quote_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_quotes_sales_representative_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_quotes_customer_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_customer_portfolios_portfolio_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_customer_portfolios_customer_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_customers_customer_status_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_customers_potential_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_customers_customer_type_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_customers_zone_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_customer_contacts_customer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_ups" DROP CONSTRAINT "FK_895a95217f24666c44a1d97c0f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "follow_ups" DROP CONSTRAINT "FK_284df519d9a5bcf0bb15c357361"`,
    );
    await queryRunner.query(
      `ALTER TABLE "attachments" DROP CONSTRAINT "FK_ab043b1da484664d5a174870227"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" DROP CONSTRAINT "FK_6d3ae93f1df46627dd633f7a5b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" DROP CONSTRAINT "FK_450ca807586cd20547adab387e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" DROP CONSTRAINT "FK_ef857caf6462fbbfdec35b79d65"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visits" DROP CONSTRAINT "FK_2f8983bc5d181167f33ba3a952a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visit_results" DROP CONSTRAINT "FK_c62da7b371048a15e7506e114ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "visit_results" DROP CONSTRAINT "FK_48467cc3251ba75f6f565b48d4a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_stops" DROP CONSTRAINT "FK_fb5c933d85c17906dafb5fb9f12"`,
    );
    await queryRunner.query(
      `ALTER TABLE "route_stops" DROP CONSTRAINT "FK_123e6e4daeae0e927f29f62656c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "routes" DROP CONSTRAINT "FK_bad6ad841c0b5fc0e355779b3b5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "routes" DROP CONSTRAINT "FK_cb378c67305ff4fadd0c0193653"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_ab0b05a3b9b83f6925ffdd41cdf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_33471ba0a166506dbd244346ba6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quote_details" DROP CONSTRAINT "FK_736948182d045f74541c5fba1ef"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT "FK_971ac7c96ffe488d394d677ce5a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "quotes" DROP CONSTRAINT "FK_e1c19b8ad84f6fcf4f71632a18c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_history" DROP CONSTRAINT "FK_ff03942cfebdde78d0b05c29ad2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_portfolios" DROP CONSTRAINT "FK_2eb7102f9ad25a41b28452b7607"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_portfolios" DROP CONSTRAINT "FK_443af8534f0eacccab5d3bc1485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_315b6f01dbaacfc460c1fbc38d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_d3a8ca659c54866ecb76ef5b0e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_a22bfd4e0c0bf10004a83a66547"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customers" DROP CONSTRAINT "FK_89def68913fed4aaa582c3aeea2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "customer_contacts" DROP CONSTRAINT "FK_e967a9292c171d64e951a7270ac"`,
    );
    await queryRunner.query(`DROP TABLE "follow_ups"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ab043b1da484664d5a17487022"`,
    );
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(`DROP TABLE "visits"`);
    await queryRunner.query(`DROP TABLE "visit_results"`);
    await queryRunner.query(`DROP TABLE "visit_outcomes"`);
    await queryRunner.query(`DROP TABLE "route_stops"`);
    await queryRunner.query(`DROP TABLE "routes"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "quote_details"`);
    await queryRunner.query(`DROP TABLE "quotes"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e0cca55ef7e112acd876ba6698"`,
    );
    await queryRunner.query(`DROP TABLE "customer_history"`);
    await queryRunner.query(`DROP TABLE "customer_portfolios"`);
    await queryRunner.query(`DROP TABLE "portfolios"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TABLE "customer_contacts"`);
    await queryRunner.query(`DROP TABLE "customer_statuses"`);
    await queryRunner.query(`DROP TABLE "potentials"`);
    await queryRunner.query(`DROP TABLE "customer_types"`);
    await queryRunner.query(`DROP TABLE "zones"`);
  }
}
