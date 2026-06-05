#!/usr/bin/env python
# Point d'entree de la commande `manage.py` pour les operations Django.
import os
import sys


def main() -> None:
    # Lance l'execution d'une commande Django depuis le terminal.
    # La fonction prepare d'abord le module de settings puis delegue au runner officiel.
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "smartestate_backend.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Django n'est pas installe. Lancez `pip install -r backend/requirements.txt`."
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
