import {NgIf, NgFor, EventEmitter, Component, View, Inject, Injectable} from 'angular2/angular2';
import {
  RouterLink,
  RouteConfig,
  Router,
  Route,
  RouterOutlet,
  Location,
  RouteParams
} from 'angular2/router';
import * as db from './data';
import {ObservableWrapper, PromiseWrapper, Promise} from 'angular2/src/core/facade/async';
import {ListWrapper} from 'angular2/src/core/facade/collection';
import {isPresent, DateWrapper} from 'angular2/src/core/facade/lang';

class InboxRecord {
  id: string = '';
  subject: string = '';
  content: string = '';
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  date: string;
  draft: boolean = false;

  constructor(data: {
    id: string,
    subject: string,
    content: string,
    email: string,
    firstName: string,
    lastName: string,
    date: string, draft?: boolean
  } = null) {
    if (isPresent(data)) {
      this.setData(data);
    }
  }

  setData(record: {
    id: string,
    subject: string,
    content: string,
    email: string,
    firstName: string,
    lastName: string,
    date: string, draft?: boolean
  }) {
    this.id = record['id'];
    this.subject = record['subject'];
    this.content = record['content'];
    this.email = record['email'];
    this.firstName = record['first-name'];
    this.lastName = record['last-name'];
    this.date = record['date'];
    this.draft = record['draft'] == true;
  }
}

@Injectable()
class DbService {
  getData(): Promise<any[]> {
    var p = PromiseWrapper.completer();
    p.resolve(db.data);
    return p.promise;
  }

  drafts(): Promise<any[]> {
    return PromiseWrapper.then(this.getData(), (data) => {
      return ListWrapper.filter(data,
                                (record => isPresent(record['draft']) && record['draft'] == true));
    });
  }

  emails(): Promise<any[]> {
    return PromiseWrapper.then(this.getData(), (data) => {
      return ListWrapper.filter(data, (record => !isPresent(record['draft'])));
    });
  }

  email(id): Promise<any> {
    return PromiseWrapper.then(this.getData(), (data) => {
      for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        if (entry['id'] == id) {
          return entry;
        }
      }
    });
  }
}

@Component({selector: 'inbox-detail'})
@View({templateUrl: "inbox-detail.html", directives: [NgFor, RouterLink]})
class InboxDetailCmp {
  record: InboxRecord = new InboxRecord();
  ready: boolean = false;

  constructor(db: DbService, params: RouteParams) {
    var id = params.get('id');
    PromiseWrapper.then(db.email(id), (data) => { this.record.setData(data); });
  }
}

@Component({selector: 'inbox'})
@View({templateUrl: "inbox.html", directives: [NgFor, RouterLink]})
class InboxCmp {
  items: InboxRecord[] = [];
  ready: boolean = false;

  constructor(public router: Router, db: DbService, params: RouteParams) {
    var sortType = params.get('sort');
    var sortEmailsByDate = isPresent(sortType) && sortType == "date";

    PromiseWrapper.then(db.emails(), emails => {
      this.ready = true;
      this.items = emails.map(data => new InboxRecord(data));

      if (sortEmailsByDate) {
        ListWrapper.sort(this.items,
                         (a, b) => DateWrapper.toMillis(DateWrapper.fromISOString(a.date)) <
                                           DateWrapper.toMillis(DateWrapper.fromISOString(b.date)) ?
                                       -1 :
                                       1);
      }
    });
  }
}


@Component({selector: 'drafts'})
@View({templateUrl: "drafts.html", directives: [NgFor, RouterLink]})
class DraftsCmp {
  items: InboxRecord[] = [];
  ready: boolean = false;

  constructor(public router: Router, db: DbService) {
    PromiseWrapper.then(db.drafts(), (drafts) => {
      this.ready = true;
      this.items = drafts.map(data => new InboxRecord(data));
    });
  }
}

@Component({selector: 'inbox-app', viewProviders: [DbService]})
@View({templateUrl: "inbox-app.html", directives: [RouterOutlet, RouterLink]})
@RouteConfig([
  new Route({path: '/', component: InboxCmp, name: 'Inbox'}),
  new Route({path: '/drafts', component: DraftsCmp, name: 'Drafts'}),
  new Route({path: '/detail/:id', component: InboxDetailCmp, name: 'DetailPage'})
])
export class InboxApp {
  router: Router;
  location: Location;
  constructor(router: Router, location: Location) {
    this.router = router;
    this.location = location;
  }
  inboxPageActive() { return this.location.path() == ''; }
  draftsPageActive() { return this.location.path() == '/drafts'; }
}
