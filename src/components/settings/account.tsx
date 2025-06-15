"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { getErrorMessage, getInitials } from "@/lib/utils";
import { PreloadedUser } from "@/lib/auth/server";
import { api } from "@gen/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoaderCircle } from "lucide-react";
import { useAuthActions } from "@convex-dev/auth/react";
import { usePreloadedQuery } from "@/lib/convex/use-preload";
import { useMutation } from "@/lib/convex/use-mutation";

const formSchemaGeneral = z.object({
  name: z.string().min(1).max(100),
});

export default function Account({ preloadedUser }: { preloadedUser: PreloadedUser }) {
  const { data: user } = usePreloadedQuery(preloadedUser);

  const { signOut } = useAuthActions();

  const formGeneral = useForm<z.infer<typeof formSchemaGeneral>>({
    resolver: zodResolver(formSchemaGeneral),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  const updateUserName = useMutation(api.users.update.one, {
    onError(e) {
      toast.error("Name could not be updated", { description: getErrorMessage(e) });
    },
    onSuccess() {
      toast.success("Name updated successfully");
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaGeneral>) {
    updateUserName.mutate({ name: values.name });
  }

  const deleteAccount = useMutation(api.users.delete.delete_account, {
    onError(e) {
      toast.error("Account could not be deleted", { description: getErrorMessage(e) });
    },
    async onSuccess() {
      await signOut();
      window.location.reload();
    },
  });

  async function onDelete() {
    await deleteAccount.mutate();
  }

  return (
    <>
      <Card className="pb-2">
        <CardHeader className="border-b">
          <div className="flex w-full items-center gap-4">
            <Avatar className="ml-auto size-12 cursor-pointer">
              <AvatarImage src={user?.image} className="transition-opacity" />
              <AvatarFallback className="text-foreground/60 bg-accent text-xl font-medium select-none">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex w-full flex-col leading-none">
              <h5 className="font-special max-w-40 overflow-hidden text-2xl text-ellipsis whitespace-nowrap">
                {user?.name ?? user?.email?.split("@")[0]}
              </h5>
              <p className="text-foreground/50 max-w-40 overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap">
                {user?.email}
              </p>
            </div>
          </div>
        </CardHeader>

        <Form {...formGeneral}>
          <form onSubmit={formGeneral.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-4 pb-7">
              <FormField
                control={formGeneral.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">Name</Label>
                    <FormControl>
                      <Input
                        id="name"
                        placeholder="Name"
                        className="placeholder:text-foreground/30 rounded-[0.5rem] border-none px-4"
                        autoCapitalize="none"
                        autoCorrect="off"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="px-2 pt-2" />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={updateUserName.isPending}>
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Delete Account</CardTitle>
          <CardDescription>This will delete your account and all your data from our servers.</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"destructive"}>Delete Account</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account and remove your data from our
                  servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant={"ghost"}>Cancel</Button>
                </DialogClose>

                <Button variant={"destructive"} disabled={deleteAccount.isPending} className="w-28" onClick={onDelete}>
                  {deleteAccount.isPending ? <LoaderCircle className="repeat-infinite animate-spin" /> : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}
