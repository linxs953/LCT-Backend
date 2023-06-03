import { Injectable, Logger } from "@nestjs/common";
import { PostgresService } from "src/feature/common/prisma/prisma.service";



@Injectable()
export class UIWidgetService {
    private uiWidgetLogger:Logger
    constructor(private readonly pgService:PostgresService) {
        this.uiWidgetLogger = new Logger(UIWidgetService.name)
    }


    findAllWidgets() {
        return new Promise(async (resolve,reject) => {
            const pageList = await this.pgService.atui_page_info.findMany()
            let pageWidgets = {}
            if (!pageList || pageList.length == 0) {
                reject(new Error("no config any page info"))
            }
            try {
                for (let page of pageList) {
                    pageWidgets[page.page_name] = {
                        url: page.page_url,
                        elements: {}
                    }
                    const widgets = await this.pgService.atui_widget_info.findMany({
                        where: {
                            page_id: page.page_id
                        }
                    })
                    for (let wid of widgets) {
                        this.uiWidgetLogger.debug(wid.widget_meta)
                        pageWidgets[page.page_name]['elements'][wid.widget_name] = JSON.parse(wid.widget_meta)
                    }
                }
                resolve(pageWidgets)
            } catch(err) {
                this.uiWidgetLogger.error(err.stack,"")
                reject(err)
            }
           
        })
    }

    async findWidgetByPageName(pageName:string) {
        return new Promise(async (resolve,reject) => {
            const pageInfo = await this.pgService.atui_page_info.findFirst({
                where : {
                    page_name: pageName
                }
            })
            if (!pageInfo) {
                reject(new Error(`not found page with [pageName=${pageName}]`))
            }

            const widgetInfo = await this.pgService.atui_widget_info.findMany({
                where: {
                    page_id: pageInfo.page_id,
                    is_enable: 1
                }
            })
            if (!widgetInfo || widgetInfo.length == 0) {
                reject(new Error(`not found widgetList with [pageName=${[pageName]}]`))
            }
            
            let data = {
                url: pageInfo.page_url,
                elements: {}
            }
            widgetInfo.map(widget => {
                try {
                    data['elements'][widget.widget_name] = JSON.parse(widget.widget_meta)
                } catch(err) {
                    this.uiWidgetLogger.error(err,"")
                    reject(err)
                }
            })
            resolve(data)
        })
    }
}