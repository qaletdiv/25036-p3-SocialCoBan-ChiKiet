"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { UserAvatar } from "@/components/common/user-avatar";
import { CharacterCounter } from "@/components/newsfeed/character-counter";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { TextField } from "@/components/ui/text-field";
import { Textarea } from "@/components/ui/textarea";
import { PROFILE_BIO_MAX_LENGTH, PROFILE_NAME_MAX_LENGTH } from "@/constants/profile";
import { USERNAME_MAX_LENGTH, USERNAME_PATTERN, USERNAME_RULE_MESSAGE } from "@/constants/username";
import { getErrorMessage } from "@/lib/error-messages";
import { formatFullDate } from "@/lib/format-time";
import { nextUsernameChangeAt } from "@/lib/username";
import { userService } from "@/services/user.service";
import type { UserProfile } from "@/types/user";

interface ProfileFormValues {
  fullName: string;
  username: string;
  bio: string;
}

interface ProfileEditFormProps {
  profile: UserProfile;
  onSaved: (profile: UserProfile) => void;
  onCancel: () => void;
}

export function ProfileEditForm({ profile, onSaved, onCancel }: ProfileEditFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: { fullName: profile.fullName, username: profile.username, bio: profile.bio ?? "" },
  });
  const bioValue = useWatch({ control, name: "bio" }) ?? "";
  const usernameLockedUntil = nextUsernameChangeAt(profile.usernameChangedAt);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const fullName = values.fullName.trim().replace(/\s+/g, " ");
    const bio = values.bio.trim();
    const username = usernameLockedUntil ? profile.username : values.username.trim();
    try {
      const updated = await userService.updateProfile(profile.id, {
        fullName,
        username,
        bio: bio.length === 0 ? null : bio,
      });
      onSaved(updated);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="flex justify-center">
        <UserAvatar fullName={profile.fullName} avatarUrl={profile.avatarUrl} size="lg" />
      </div>
      <TextField
        id="profile-full-name"
        label="Họ và tên"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register("fullName", {
          validate: (value) => value.trim().length > 0 || "Vui lòng nhập họ và tên.",
          maxLength: {
            value: PROFILE_NAME_MAX_LENGTH,
            message: "Họ và tên không được vượt quá 100 ký tự.",
          },
        })}
      />
      <TextField
        id="profile-username"
        label="Tên đăng nhập"
        autoComplete="username"
        error={errors.username?.message}
        {...register("username", {
          validate: (value) => USERNAME_PATTERN.test(value.trim()) || USERNAME_RULE_MESSAGE,
          maxLength: { value: USERNAME_MAX_LENGTH, message: USERNAME_RULE_MESSAGE },
        })}
        disabled={usernameLockedUntil !== null}
      />
      <p className="text-xs text-zinc-500">
        {usernameLockedUntil
          ? `Bạn có thể đổi tên đăng nhập từ ${formatFullDate(usernameLockedUntil.toISOString())}.`
          : "Sau khi đổi, bạn phải đợi 14 ngày mới đổi tiếp."}
      </p>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="profile-bio" className="text-sm font-medium text-foreground">
            Tiểu sử
          </label>
          <CharacterCounter length={bioValue.length} maxLength={PROFILE_BIO_MAX_LENGTH} />
        </div>
        <Textarea
          id="profile-bio"
          rows={4}
          placeholder="Giới thiệu ngắn về bạn"
          aria-invalid={errors.bio ? true : undefined}
          {...register("bio", {
            maxLength: {
              value: PROFILE_BIO_MAX_LENGTH,
              message: "Tiểu sử không được vượt quá 160 ký tự.",
            },
          })}
        />
        {errors.bio?.message && (
          <p role="alert" className="text-sm text-rose-600">
            {errors.bio.message}
          </p>
        )}
      </div>
      {serverError && (
        <FormAlert variant="error">
          <p>{serverError}</p>
        </FormAlert>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" className="sm:w-auto" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" className="sm:w-auto" isLoading={isSubmitting} disabled={bioValue.length > PROFILE_BIO_MAX_LENGTH}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}
