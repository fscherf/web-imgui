export function getCookie(name: string): string {
    const cookies = decodeURIComponent(document.cookie).split(';');

    name = name + '=';

    for(let index = 0; index < cookies.length; index++) {
        let cookie = cookies[index];

        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }

        if (cookie.indexOf(name) == 0) {
            return cookie.substring(name.length, cookie.length);
        };

    };

    return '';
}

export function setCookie(name: string, value: any, expire_days: number): void {
    const date = new Date();

    date.setTime(date.getTime() + (expire_days*24*60*60*1000));

    document.cookie = (
        name + '=' + value + ';expires=' + date.toUTCString() + ';path=/');
};