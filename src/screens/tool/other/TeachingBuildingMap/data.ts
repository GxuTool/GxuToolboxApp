export interface TeachBuildingFloor{
    id:string;
    name:string;
    image:any;
}

export interface TeachBuilding{
    id:string;
    name:string;
    floors:TeachBuildingFloor[];
}

export const TeachBuildingList:TeachBuilding[]=[{
    id: "liujiao",
    name: "第六教学楼",
    floors:[
        {
            id:"1",
            name:"1楼",
            image:require("./pictures/liujiao/1.jpeg"),
    },
        {
           id:"2",
           name:"2楼",
           image:require("./pictures/liujiao/2.jpeg"),
        },
        {
            id:"3",
            name:"3楼",
            image:require("./pictures/liujiao/3.jpeg"),
        },
        {
            id:"4",
            name:"4楼",
            image:require("./pictures/liujiao/4.jpeg"),
        },
        {
            id:"5",
            name:"5楼",
            image:require("./pictures/liujiao/5.jpeg"),
        },
        {
            id:"6",
            name:"6楼",
            image:require("./pictures/liujiao/6.jpeg"),
        },
        {
            id:"all",
            name:"总楼层图",
            image:require("./pictures/liujiao/all.jpeg"),
        },
    ],
    },
];
