import { Param } from "@nestjs/common";
import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";


export class FindSceneInfoParamDto {
    
    @IsNotEmpty()
    @IsString()
    sceneId: string
}

export class DeleteSceneInfoParamDto {
    @IsNotEmpty()
    @IsString()
    sceneId: string
}


export class CreateSceneInfoDto {

    @IsNotEmpty()
    @IsString()
    sceneName: string

    @IsNotEmpty()
    @IsString()
    moduleId: string

    @IsNotEmpty()
    @IsString()
    dataId?: string
}

export class UpdateSceneDto {
    @IsNotEmpty()
    @IsString()
    sceneId: string

    @IsNotEmpty()
    @IsString()
    sceneName?: string

    @IsNotEmpty()
    @IsString()
    moduleId?: string

    @IsNotEmpty()
    @IsString()
    dataId?: string

    @IsNotEmpty()
    @IsNumber()
    isEnable?: number

}


 export class CreateRelationDto {

    @IsNotEmpty()
    @IsString()
    sceneId: string

    @IsNotEmpty()
    @IsArray()
    caseIdList: Array<string>
 }


 export class FindRelationParamDto {

    @IsNotEmpty()
    @IsString()
    sceneId:string    
 }


 export class UpdateRelationDto {
    
    @IsNotEmpty()
    @IsString()
    sceneId:string

    @IsNotEmpty()
    @IsString()
    caseId:string

    @IsString()
    @IsNotEmpty()
    expect?: string

    @IsString()
    @IsNotEmpty()
    api_config?: string

    @IsString()
    @IsNotEmpty()
    case_name?: string

    @IsNumber()
    @IsNotEmpty()
    step_no?: number

    @IsString()
    @IsNotEmpty()
    extract?: string
    
 }

 export class DeleteRelationParamDto extends FindRelationParamDto {}

