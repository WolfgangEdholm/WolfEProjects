import {SidePanelService} from './side-panel.service';

describe('SidePanelService', () => {
  let service: SidePanelService;

  beforeEach(() => {
    service = new SidePanelService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
