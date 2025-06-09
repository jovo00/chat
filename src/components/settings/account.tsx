"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getInitials } from "@/lib/utils";

const formSchemaGeneral = z.object({
  name: z.string().min(8).max(50),
  username: z.string().min(2).max(50),
});

const formSchemaPassword = z.object({
  oldPassword: z.string().min(8).max(99),
  password: z.string().min(8).max(99),
  passwordConfirm: z.string().min(8).max(99),
});

export default function Account({ preloadedUser }: { preloadedUser: Preloaded<typeof api.users.user.current> }) {
  const { user } = usePreloadedQuery(preloadedUser);

  const formGeneral = useForm<z.infer<typeof formSchemaGeneral>>({
    resolver: zodResolver(formSchemaGeneral),
    defaultValues: {
      name: user?.name ?? "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaGeneral>) {}

  return (
    <>
      <Card>
        <CardHeader className="border-b mb-6">
          <div className="w-full flex gap-4 items-center">
            <Avatar className="ml-auto h-10 w-10 cursor-pointer">
              <AvatarImage src={user?.image} className="transition-opacity" />
              <AvatarFallback className="text-foreground/60 bg-accent font-medium select-none">
                {getInitials(user?.name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col w-full">
              <h5 className="font-medium text-base whitespace-nowrap max-w-40 overflow-hidden text-ellipsis">
                {user?.name ?? user?.email?.split("@")[0]}
              </h5>
              <p className="font-medium text-xs text-foreground/50 whitespace-nowrap max-w-40 overflow-hidden text-ellipsis">
                {user?.email}
              </p>
            </div>
          </div>
        </CardHeader>

        <Form {...formGeneral}>
          <form onSubmit={formGeneral.handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={formGeneral.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="name">Name</Label>
                    <FormControl>
                      <Input
                        id="name"
                        placeholder="username or email"
                        className="border-none placeholder:text-foreground/30"
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
              <Button>Save Changes</Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </>
  );
}
