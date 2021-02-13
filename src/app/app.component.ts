import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdService } from './ad.service';
import { faSearch, faRedo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  faSearch = faSearch
  faRedo = faRedo

  public isLoadMoreLoading = false;
  public isSearchLoading = false;

  public orderAttributes = [
      { id: 'score', name: 'Релевантност' },
      { id: 'upload_time', name: 'Най-нови' },
      { id: 'literacy', name: 'Грамотност' }
  ];

  public adCount = null;
  public orderBy = 'score';
  public searchQuery = '';

  public ads: Array<any> = [];
  public pageOrderedBy = '';
  public pageSearchQuery = '';
  public maxScore: number = 0;
  public totalCount: number = 0;
  public requestTime = null;
  public showLoadMore = false;

  private pageSize = 20;
  private currentPage = 0;

  constructor(private adService: AdService) {

  }

  ngOnInit () {
    this.loadAdCount()
  }

  public search() {
    if (this.searchQuery == null || this.searchQuery == '' || this.orderBy == null || this.orderBy == '') {
      return;
    }

    this.pageOrderedBy = '';
    this.pageSearchQuery = '';
    this.isSearchLoading = true;
    this.loadAdCount();
    this.adService.get_ads(this.searchQuery, this.orderBy, 0, this.pageSize)
      .subscribe(result => {
        this.ads = result["hits"];
        this.totalCount = result["total_count"];
        this.maxScore = result["max_score"];
        this.requestTime = result["took"];
        this.pageOrderedBy = this.orderBy;
        this.pageSearchQuery = this.searchQuery;
        this.currentPage = 0;
        
        this.showLoadMore = true;
        if ((result["hits"] as Array<any>).length < this.pageSize) {
          this.showLoadMore = false;
        }

        this.isSearchLoading = false;
      }, error => {
        console.log("Error during ad list load operation.")
        console.log(error)

        this.isSearchLoading = false;
      });
  }

  public loadMore() {
    this.isLoadMoreLoading = true;
    this.adService.get_ads(this.pageSearchQuery, this.pageOrderedBy, this.currentPage + 1, this.pageSize)
      .subscribe(result => {
        this.ads.push(...(result["hits"] as Array<any>))
        this.totalCount = result["total_count"];
        this.requestTime = result["took"];
        this.currentPage += 1;

        if ((result["hits"] as Array<any>).length < this.pageSize) {
          this.showLoadMore = false;
        }

        this.isLoadMoreLoading = false;
      }, error => {
        console.log("Error during ad load more operation.")
        console.log(error)

        this.isLoadMoreLoading = false;
      });
  }

  private loadAdCount() {
    this.adService.get_ads_count().subscribe(
      result => {
        this.adCount = result["count"];
      }, error => {
        console.log("Error during count load operation.")
        console.log(error)
      }
    );
  }

  public getAdScore(ad: any) {
    return Math.floor(100 * ad['score'] / this.maxScore);
  }

  public openAdLink(ad: any) {
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = ad['source']['url'];
    link.setAttribute('visibility', 'hidden');
    link.click();
  }

  public getBadgeClass(percent: number): string {
    if (percent >= 75) {
      return 'badge-success';
    } else if (percent > 25) {
      return 'badge-warning';
    }

    return 'badge-danger';
  }

  public parseDate(date: string) {
    const datepipe: DatePipe = new DatePipe('en-US')
    const formattedDate = datepipe.transform(Date.parse(date), 'dd.MM.YYYY HH:mm')
    
    return formattedDate;
  }

  public parseDescription(description: string): string {
    if (description.length < 500) {
      return description;
    }

    return description.substr(0, 500) + '...';
  }

  public setDefaultPic(ad: any) {
    ad['source']['image_url'] = "assets/no-image.png";
  }
}
