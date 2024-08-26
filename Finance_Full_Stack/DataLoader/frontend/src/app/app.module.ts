import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StandardModule } from './standard/standard.module';
import { ServicesModule } from './services/services.module';
import { UIEngineModule } from './ui-engine/ui-engine.module';
import { ModalsModule } from './modals/modals.module';
import { Md2Module } from './md2/md2.module';

import { HomeRoutingModule } from './home/home-routing.module';
import { TransRoutingModule } from './trans/trans-routing.module';
import { QueryRoutingModule } from './query/query-routing.module';
import { ReportsRoutingModule } from './reports/reports-routing.module';
import { SegmentRoutingModule } from './segment/segment-routing.module';
import { UserRoutingModule } from './user/user-routing.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app/app.component';
import { DataComponent } from './data/data.component';
import { SettingsComponent } from './settings/settings.component';
import { TestComponent } from './test/test.component';

@NgModule({
  declarations: [
    AppComponent,
    DataComponent,
    SettingsComponent,
    TestComponent,
  ],
  imports: [
    // Global
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,

    // Local
    StandardModule,
    ServicesModule,
    UIEngineModule,
    ModalsModule,
    Md2Module,

    // Routing
    HomeRoutingModule,
    TransRoutingModule,
    QueryRoutingModule,
    ReportsRoutingModule,
    SegmentRoutingModule,
    UserRoutingModule,
    AppRoutingModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
