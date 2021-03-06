import {Component, provide} from 'angular2/angular2';
import {bootstrap} from 'angular2/bootstrap';
import {
  RouteConfig,
  Route,
  ROUTER_PROVIDERS,
  ROUTER_DIRECTIVES,
  HashLocationStrategy,
  LocationStrategy
} from 'angular2/router';

import {reflector} from 'angular2/src/core/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/core/reflection/reflection_capabilities';

@Component({selector: 'hello-cmp', template: `hello`})
class HelloCmp {
}


@Component({selector: 'goodbye-cmp', template: `goodbye`})
class GoodByeCmp {
}


@Component({
  selector: 'example-app',
  template: `
    <h1>My App</h1>
    <nav>
      <a href="#/" id="hello-link">Navigate via href</a> |
      <a [router-link]="['/GoodbyeCmp']" id="goodbye-link">Navigate with Link DSL</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
  new Route({path: '/', component: HelloCmp, name: 'HelloCmp'}),
  new Route({path: '/bye', component: GoodByeCmp, name: 'GoodbyeCmp'})
])
class AppCmp {
}


export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(AppCmp,
            [ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy})]);
}
