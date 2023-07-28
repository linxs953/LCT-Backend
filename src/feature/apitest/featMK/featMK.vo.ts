import { Prisma } from "@prisma/client";

export interface FindModuleInfoRecordVO {
    data: Prisma.at_module_infoCreateInput,
    error: Error
}

export interface FindModuleInfoRecordsVO {
    data: {},
    error: Error
}