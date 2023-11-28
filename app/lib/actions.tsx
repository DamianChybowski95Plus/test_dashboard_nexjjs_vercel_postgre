'use server'; // Server actions; 

// By adding the 'use server', 
// you mark all the exported functions within the file as server functions. 
// These server functions can then be imported into Client and Server components, making them extremely versatile.

// Server actions/functions tworzą rest api dla danej aplikacji, 
// tak że nie musimy ich budować osobno, czy manualnie zwracając uwagę na URL

import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';

// Validacja formularza używając 'zod'

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: "Please Select a customer"
    }),
    amount: z.coerce
        .number({})
        .gt(0, { message : "Please enter number greater than 0$."}),
    status: z.enum(['pending', 'paid'],{
        invalid_type_error: "Please select an invoice status."
    }),
    date: z.string(),
});


// TS
export type State = {
    errors?: {
      customerId?: string[];
      amount?: string[];
      status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {

    // Safe parse to validacja która również zwraca czy właściwość success
    const validatedForm = FormSchema.omit({ id: true, date: true }).safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if( !validatedForm.success ){
        return {
            errors: validatedForm.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    const { customerId, amount, status } = validatedForm.data
    const amountInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    
    try{        
        await sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
    } catch (error) {
        return {
            message : "Database Error: Failed to create invoice",
            error : error
        };
    }
    

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

 
export async function updateInvoice(id: string, formData: FormData) {

    const UpdateInvoice = FormSchema.omit({ id: true, date: true });

    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
 
    const amountInCents = amount * 100;
 
    try{        
        await sql`
            UPDATE invoices
            SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
            WHERE id = ${id}`;
    } catch( error ){
        return {
            message : "Database Error: Failed to update invoice",
            error: error
        }
    }   
 
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


export async function deleteInvoice({ id } : { id : string }){
  try{
    await sql`DELETE FROM invoices WHERE id = ${id}`;
  } catch( error ){
    return {
        message : "Database Error: Failed to delete invoice",
        error: error
    }
  }

  revalidatePath('/dashboard/invoices');
}


export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
  ) {
    try {
      await signIn('credentials', Object.fromEntries(formData));
    } catch (error) {
      if ((error as Error).message.includes('CredentialsSignin')) {
        return 'CredentialsSignin';
      }
      throw error;
    }
  }