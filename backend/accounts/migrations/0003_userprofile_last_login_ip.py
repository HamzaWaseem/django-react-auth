# Generated by Django 5.1.5 on 2025-02-06 16:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_userpreferences"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="last_login_ip",
            field=models.GenericIPAddressField(blank=True, null=True),
        ),
    ]
