export const solutionIconStyle = (icon = ""): string => `${icon} mc-icon-menu-color`;

export const iconStyle = (icon = ""): string => icon ? `${icon} mc-top-menu-icon` : 'fa fa-briefcase mc-top-menu-icon';

export const catItemIconStyle = (icon = ""): string => icon ? `${icon}` : "fa fa-briefcase";

export const catRoute = (item: any): void => console.log("category items page: ", item);


// material styles

export interface ComputedStyle {
    styles?: string;
    iconName?: string;
}

export const materialHeaderIconStyle = (icon = ""): ComputedStyle => {
    return icon ? {styles: "material-icons mc-inline-icon", iconName: `${icon}`} : {
        styles: "material-icons mc-inline-icon", iconName: "home_repair_service"
    };
}

export const materialSolutionIconStyle = (icon = ""): ComputedStyle => {
    return icon ? {styles: "material-icons mc-inline-icon mc-icon-menu-color", iconName: `${icon}`} : {
        styles: "material-icons mc-inline-icon mc-icon-menu-color", iconName: "home_repair_service"
    };
}

export const materialIconStyle = (icon = ""): ComputedStyle => {
    return icon ? {styles: "material-icons mc-inline-icon mc-top-menu-icon", iconName: `${icon}`} : {
        styles: "material-icons mc-inline-icon mc-top-menu-icon", iconName: "home_repair_service"
    };
}

export const materialCatItemIconStyle = (icon = ""): ComputedStyle => {
    return icon ? {styles: "material-icons mc-inline-icon mc-top-menu-icon", iconName: `${icon}`} : {
        styles: "material-icons mc-inline-icon mc-top-menu-icon", iconName: "home_repair_service"
    };
}
