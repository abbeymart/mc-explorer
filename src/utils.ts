export function shortString(str: string, maxLength = 20): string {
    return str.toString().length > maxLength ? str.toString().substring(0, maxLength) + "..." : str.toString();
}