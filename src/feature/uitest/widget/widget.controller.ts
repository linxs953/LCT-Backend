import { Controller, Get, HttpStatus, Query, Res } from "@nestjs/common";
import { UITEST_CONFIG } from "../uitest.config";
import { UIWidgetService } from "./widget.service";



@Controller(`${UITEST_CONFIG.routePrefix}/widgetService`)
export class UIWidgetController {
    constructor(private readonly widgetService:UIWidgetService) {

    }
    @Get("getWidgets")
    async getWidget(@Query() query, @Res() resp) {
        const pageName = query.pageName
        try {
            const widgets = await this.widgetService.findWidgetByPageName(pageName)
            
            resp.status(HttpStatus.OK).send({
                data: widgets,
                success: true,
                message: "fetch page widget successfully"
            })
        } catch(err) {
            resp.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
                message: err.message,
                success: false,
                data: null
            })
            return
        }
 
    }

    @Get("getAllWidgets")
    async getAllPageWidgets(@Res() resp) {
        try {
            const allWidgets = await this.widgetService.findAllWidgets()
            let res = {}
            for (let pageName of Object.keys(allWidgets)) {
                const elements = allWidgets[pageName]['elements']
                if (Object.keys(elements).length == 0) {
                    continue
                }
                res[pageName] = allWidgets[pageName]
            }
            resp.status(HttpStatus.OK).send({
                success: true,
                message: "fetch all page widgets successfully",
                data: res
            })
            return
        } catch(err) {
            resp.status(HttpStatus.OK).send({
                success: false,
                message: err.message,
                data: null,
            })
            return
        }
        
    }
    
}