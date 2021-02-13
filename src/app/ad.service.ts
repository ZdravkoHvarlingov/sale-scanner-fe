import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root'
})
export class AdService {

    constructor(private http: HttpClient) {}

    public get_ads(query_string: string, order_by: string, page: number, size: number): Observable<any> {
        const endpoint = environment.api_url + '/ads/list';
        const body = {
            'query': query_string
        }
        const params: any = {'order_by': order_by, 'page': page, 'size': size};
        return this.http.put(endpoint, body, {params: params})
    }

    public get_ads_count(): Observable<any> {
        const endpoint = environment.api_url + '/ads/count';
        return this.http.get(endpoint);
    }
}
