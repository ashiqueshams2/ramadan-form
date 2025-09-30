'use client';

import { useFormState } from 'react-dom';
import { initialState, submitForm } from './actions/submitForm';

export default function Home() {
  const [state, formAction] = useFormState(submitForm, initialState);

  return (
    <div className="form-container">
      <h2>রমজান তথ্য ফর্ম</h2>
      <form action={formAction}>
        <label htmlFor="name">নাম:</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="menu">রমজান মাসজুড়ে কি আপনার রেগুলার মেন্যু থাকবে?</label>
        <select id="menu" name="menu" required>
          <option value="">-- নির্বাচন করুন --</option>
          <option value="হ্যাঁ">হ্যাঁ</option>
          <option value="না">না</option>
        </select>

        <label htmlFor="open-time">খোলার সময়:</label>
        <input id="open-time" name="open-time" type="time" required />

        <label htmlFor="close-time">বন্ধের সময়:</label>
        <input id="close-time" name="close-time" type="time" required />

        <label htmlFor="iftar">ইফতার মেনু আছে কি?</label>
        <select id="iftar" name="iftar" required>
          <option value="">-- নির্বাচন করুন --</option>
          <option value="হ্যাঁ">হ্যাঁ</option>
          <option value="না">না</option>
        </select>

        <label htmlFor="iftar-menu">ইফতার মেনু:</label>
        <textarea id="iftar-menu" name="iftar-menu" rows={3} />

        <label htmlFor="iftar-file">ইফতার মেনুর ফাইল আপলোড করুন:</label>
        <input id="iftar-file" name="iftar-file" type="file" accept="image/*,.pdf" />

        <label htmlFor="sehri">সেহরি মেনু আছে কি?</label>
        <select id="sehri" name="sehri" required>
          <option value="">-- নির্বাচন করুন --</option>
          <option value="হ্যাঁ">হ্যাঁ</option>
          <option value="না">না</option>
        </select>

        <label htmlFor="sehri-menu">সেহরি মেনু:</label>
        <textarea id="sehri-menu" name="sehri-menu" rows={3} />

        <label htmlFor="sehri-file">সেহরি মেনুর ফাইল আপলোড করুন:</label>
        <input id="sehri-file" name="sehri-file" type="file" accept="image/*,.pdf" />

        <label htmlFor="sehri-start-time">সেহরির শুরুর সময়:</label>
        <input id="sehri-start-time" name="sehri-start-time" type="time" />

        <label htmlFor="sehri-end-time">সেহরির শেষ সময়:</label>
        <input id="sehri-end-time" name="sehri-end-time" type="time" />

        <button type="submit">জমা দিন</button>
      </form>

      {state.message ? (
        <p className={state.status === 'success' ? 'success' : 'error'}>{state.message}</p>
      ) : null}
    </div>
  );
}
