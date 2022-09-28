/**
 * @jest-environment jsdom
 */

/* eslint-disable */

import { fireEvent, screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import NewBill from '../containers/NewBill.js';
import { ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import mockStore from '../__mocks__/store.js';
import router from '../app/Router';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then the mail icon inside the vertical navbar should be highlighted', async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock });
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
      }));
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon.className).toBe('active-icon');
    });

    describe('When I click on the submit button after filling all the form\'s required fields and attaching a valid file', () => {
      test('Then the form should be submitted', async () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });
        window.localStorage.setItem('user', JSON.stringify({
          type: 'Employee',
        }));
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);
        router();
        window.onNavigate(ROUTES_PATH.NewBill);
        // Create new bill instance
        const testBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        });
        // Create mock form submit function
        const testFormSubmit = jest.fn((e) => testBill.handleSubmit(e));
        // Add event listener to form
        const form = screen.getByTestId('form-new-bill');
        form.addEventListener('submit', testFormSubmit);
        // Select Submit button
        const submitBtn = screen.getByText(/^envoyer$/i);
        expect(submitBtn.className).toContain('btn');
        // Check that required fields are empty
        const dateInput = screen.getByTestId('datepicker');
        dateInput.value = '2022-01-01';
        expect(dateInput.value).not.toBe('');
        const amountInput = screen.getByTestId('amount');
        amountInput.value = '500';
        expect(+amountInput.value).toStrictEqual(500);
        const vatPercentInput = screen.getByTestId('pct');
        vatPercentInput.value = '20';
        expect(+vatPercentInput.value).toStrictEqual(20);
        // Create test file
        const testFile = new File(['valid png file'], 'valid-file.png', {
          type: 'image/png',
        });
        const fileInput = screen.getByTestId('file');
        userEvent.upload(fileInput, testFile);
        expect(fileInput.files).toHaveLength(1);
        expect(testBill.fileTypeIsValid).toBe(true);
        // Select form and try submitting it
        expect(form).toHaveLength(9);
        fireEvent.submit(form);
        expect(testFormSubmit).toBeCalled();
      });
    });
  });
});
