import { IsNotEmpty, IsString } from "class-validator"


export class FindModuleParamDto {
    
    @IsNotEmpty()
    @IsString()
    moduleId: string
}

export class CreateModuleDto {

    @IsNotEmpty()
    @IsString()
    moduleName: string

    @IsNotEmpty()   
    @IsString() 
    businessBelong: string

    @IsNotEmpty()
    @IsString()
    ownerName: string
}


export class UpdateModuleDto {

    @IsNotEmpty()
    @IsString()
    moduleId: string

    @IsNotEmpty()
    @IsString()
    moduleName?: string

    @IsNotEmpty()
    @IsString()
    businessBelong?: string

    @IsNotEmpty()
    @IsString()
    ownerName?: string
}


export class DeleteModuleParamDto {
    
    @IsNotEmpty()
    @IsString()
    moduleId: string
}