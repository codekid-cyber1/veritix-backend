import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVerificationFields1776906641125 implements MigrationInterface {
    name = 'AddVerificationFields1776906641125';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "verificationCode" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "verificationCodeExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationCodeExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verificationCode"`);
    }
}
