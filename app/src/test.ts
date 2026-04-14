// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { DataService } from 'src/app/core/services/elasticsearch/data.service';

const win = window as any;

// Suppress Matomo lookup warnings during tests.
win._paq = win._paq || [];

// Prevent tests from calling remote APIs through DataService.
Object.assign(DataService.prototype as any, {
  findById: async () => null,
  findMultipleById: async () => [],
  findArtworksByType: async () => [],
  countArtworksByType: async () => 0,
  getHasPartMovements: async () => [],
  getPartOfMovements: async () => [],
  findArtworksByMovement: async () => [],
  searchResultsByType: async () => [],
  countSearchResultItems: async () => 0,
  getEntityItems: async () => [],
  countEntityItems: async () => 0,
  findByLabel: async () => [],
  getCategoryItems: async () => [],
  getIconclassData: async () => [],
});

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting(), {
  teardown: { destroyAfterEach: false },
});
