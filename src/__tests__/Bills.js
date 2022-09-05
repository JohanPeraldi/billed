/**
 * @jest-environment jsdom
 */

/* eslint-disable */

import { screen, waitFor } from '@testing-library/dom';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';

import router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on Bills Page', () => {
    test('Then bill icon in vertical layout should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId('icon-window'));
      const windowIcon = screen.getByTestId('icon-window');
      expect(windowIcon.className).toBe('active-icon');
    });
    test('Then bills should be ordered from latest to earliest', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const reverseChrono = (a, b) => (a < b ? 1 : -1);
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
      const sortedDates = [...dates].sort(reverseChrono);
      function checkReverseChronoOrder(datelist) {
        let datesAreSortedReverseChrono;
        for (let i = 0; i < datelist.length; i++) {
          if (datelist[i] < datelist[i + 1]) {
              datesAreSortedReverseChrono = false;
              break;
          } else {
              datesAreSortedReverseChrono = true;
          }
        }

        return datesAreSortedReverseChrono;
      }
      expect(checkReverseChronoOrder(dates)).toBe(false);
      expect(checkReverseChronoOrder(sortedDates)).toBe(true);
    });
  });
});
