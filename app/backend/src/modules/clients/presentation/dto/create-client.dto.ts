import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContactoNestedDto {
  @IsNotEmpty({ message: 'El nombre del contacto es obligatorio' })
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  cargo?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico del contacto no es válido' })
  email?: string;

  @IsOptional()
  principal?: boolean;
}

export class CreateClientDto {
  @IsNotEmpty({ message: 'El NIT es obligatorio' })
  @IsString()
  nit: string;

  @IsNotEmpty({ message: 'La razón social es obligatoria' })
  @IsString()
  razon_social: string;

  @IsOptional()
  @IsString()
  nombre_comercial?: string;

  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  @IsString()
  direccion: string;

  @IsNotEmpty({ message: 'El departamento es obligatorio' })
  @IsString()
  departamento: string;

  @IsNotEmpty({ message: 'El municipio es obligatorio' })
  @IsString()
  municipio: string;

  @IsOptional()
  @IsString()
  barrio?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email?: string;

  @IsNotEmpty({ message: 'La zona o territorio es obligatoria' })
  zona: string | number;

  @IsNotEmpty({ message: 'El tipo de cliente es obligatorio' })
  tipo_cliente: string | number;

  @IsNotEmpty({ message: 'El potencial es obligatorio' })
  potencial: string | number;

  @IsOptional()
  estado_cliente?: string | number;

  @IsOptional()
  @IsInt({
    message: 'La frecuencia de visita en días debe ser un número entero',
  })
  @Min(1, { message: 'La frecuencia de visita mínima es de 1 día' })
  frecuencia_visita_dias?: number;

  @IsOptional()
  @IsArray()
  portafolios?: (string | number)[];

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;

  // Contacto principal en campos planos
  @IsOptional()
  @IsString()
  contacto_nombre?: string;

  @IsOptional()
  @IsString()
  contacto_cargo?: string;

  @IsOptional()
  @IsString()
  contacto_telefono?: string;

  @IsOptional()
  @IsString()
  contacto_celular?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo del contacto no es válido' })
  contacto_email?: string;

  // O como arreglo de contactos o contacto anidado
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactoNestedDto)
  contactos?: ContactoNestedDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactoNestedDto)
  contacto?: ContactoNestedDto;
}
