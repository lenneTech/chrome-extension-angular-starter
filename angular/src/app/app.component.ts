import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { environment } from '../environments/environment';
import { Data } from './core/models/data.model';
import { DataService } from './core/services/data.service';
import { TAB_ID } from './tab-id.injector';

/**
 * App
 * Initialized by chrome/src/background.ts
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
// tslint:disable:variable-name
export class AppComponent implements OnInit {
  // ===================================================================================================================
  // Properties
  // ===================================================================================================================

  // Data
  data: Data[];

  // Version from package.json
  version = environment.version;

  // ===================================================================================================================
  // Initializations
  // ===================================================================================================================

  /**
   * Constructor
   */
  constructor(
    @Inject(TAB_ID) private readonly tabId: number,
    private dataService: DataService,
    private readonly _changeDetector: ChangeDetectorRef // Necessary to update the view
  ) {}

  /**
   * Initializations
   */
  ngOnInit() {
    // Subscribe data
    this.dataService.dataObservable.subscribe((data) => {
      this.data = data;
      this._changeDetector.detectChanges(); // Necessary to update the view
    });
  }

  // ===================================================================================================================
  // Methods
  // ===================================================================================================================

  /**
   * Clear data
   */
  clearData() {
    const removeData = confirm('Remove all data?');
    if (removeData) {
      this.data = [];
      this.dataService.data = [];
      this._changeDetector.detectChanges(); // Necessary to update the view
    }
  }
}
