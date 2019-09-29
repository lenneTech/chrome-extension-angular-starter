import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Integrate your routes here
const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
