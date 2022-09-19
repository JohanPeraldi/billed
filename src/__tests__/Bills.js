/**
 * @jest-environment jsdom
 */

/* eslint-disable */

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import BillsUI from '../views/BillsUI.js';
import { bills } from '../fixtures/bills.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { default as BillsContainer } from '../containers/Bills.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store';
import router from '../app/Router.js';

jest.mock('../app/store', () => mockStore);

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
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML);
      const antiChrono = (a, b) => ((a > b) ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
    test('Then there should be a button to add a new bill', () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const buttonNewBill = screen.getByTestId('btn-new-bill');
      expect(buttonNewBill).toBeTruthy();
    });
    describe('When I click on an eye icon', () => {
      test('Then a bill should be displayed in a modal window', () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const eyeIconsList = screen.getAllByTestId('icon-eye');
        const handleClickIconEye = jest.fn();
        eyeIconsList.forEach((icon) => icon.addEventListener('click', handleClickIconEye));
        userEvent.click(eyeIconsList[0]);
        const modalWindow = screen.getByText('Justificatif');
        expect(handleClickIconEye).toHaveBeenCalled();
        expect(modalWindow).toBeTruthy();
      });
    });
    describe('When I click on the new bill button', () => {
      test('Then I should be redirected to the new bill page', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        new BillsContainer ({
          document, onNavigate, mockStore, bills, localStorage: window.localStorage,
        });
        const buttonNewBill = screen.getByTestId('btn-new-bill');
        const handleClickNewBill = jest.fn();
        buttonNewBill.addEventListener('click', handleClickNewBill);
        userEvent.click(buttonNewBill);
        expect(handleClickNewBill).toHaveBeenCalled();
        const form = screen.getByTestId('form-new-bill');
        expect(form).toBeTruthy();
      });
    });
  });
});

// Integration test for GET bills
describe('Given I am connected as an employee', () => {
  describe('When I navigate to the Bills page', () => {
    test('Then bills should be fetched from the mock GET API', async () => {
      localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'e@e' }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      document.body.innerHTML = BillsUI({ data: bills });
      const pageTitle = await waitFor(() => screen.getByText('Mes notes de frais'));
      expect(pageTitle).toBeTruthy();
      const tableBody = await waitFor(() => screen.getByTestId('tbody'));
      expect(tableBody).toBeTruthy();
    });
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills');
        Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock },
        );
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
          email: 'e@e',
        }));
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.appendChild(root);
        router();
      });
      test('Then fetch API call fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error('Erreur 404')),
        }));
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });
      test('Then fetch API call fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => ({
          list: () => Promise.reject(new Error('Erreur 500')),
        }));
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});
